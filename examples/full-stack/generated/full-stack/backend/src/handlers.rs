use actix_web::{web, HttpResponse, Responder};
use chrono::{NaiveDateTime, Utc};
use serde_json::json;
use sqlx::PgPool;

use crate::models::*;

// ── Member: Register ───────────────────────────────────────────────────

pub async fn register(
    pool: web::Data<PgPool>,
    body: web::Json<RegisterRequest>,
) -> impl Responder {
    let full_name = format!("{} {}", body.first_name, body.last_name);
    let result = sqlx::query_scalar::<_, i32>(
        "INSERT INTO members (name, address, age, email) VALUES ($1, $2, $3, $4) RETURNING member_id",
    )
    .bind(&full_name)
    .bind(&body.address)
    .bind(body.age)
    .bind(&body.email)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(member_id) => HttpResponse::Created().json(json!({
            "member_id": member_id,
            "name": full_name,
            "message": "Registration successful"
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Member: Login ──────────────────────────────────────────────────────

pub async fn login(
    pool: web::Data<PgPool>,
    body: web::Json<LoginRequest>,
) -> impl Responder {
    let result = sqlx::query_scalar::<_, String>(
        "SELECT name FROM members WHERE member_id = $1",
    )
    .bind(body.member_id)
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(name)) => HttpResponse::Ok().json(json!({
            "member_id": body.member_id,
            "name": name,
            "message": "Login successful"
        })),
        Ok(None) => HttpResponse::Unauthorized().json(json!({"error": "invalid member ID"})),
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Member: Checkout ───────────────────────────────────────────────────

pub async fn checkout(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    body: web::Json<CheckoutRequest>,
) -> impl Responder {
    let member_id = path.into_inner();
    let now = Utc::now().naive_utc();
    let expected_return = now + chrono::Duration::days(14);

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    };

    for &book_id in &body.book_ids {
        // Check availability
        let copies: Option<i32> = sqlx::query_scalar(
            "SELECT number_of_copies FROM books WHERE book_id = $1",
        )
        .bind(book_id)
        .fetch_optional(&mut *tx)
        .await
        .unwrap_or(None);

        match copies {
            None => {
                return HttpResponse::NotFound().json(json!({"error": format!("book not found: {}", book_id)}));
            }
            Some(c) if c <= 0 => {
                return HttpResponse::Conflict().json(json!({"error": format!("no copies available for book: {}", book_id)}));
            }
            _ => {}
        }

        // Decrement copies
        let _ = sqlx::query("UPDATE books SET number_of_copies = number_of_copies - 1 WHERE book_id = $1")
            .bind(book_id)
            .execute(&mut *tx)
            .await;

        // Insert ledger entry
        let _ = sqlx::query(
            "INSERT INTO book_borrow_ledger (book_id, member_id, borrow_date, expected_return) VALUES ($1, $2, $3, $4)",
        )
        .bind(book_id)
        .bind(member_id)
        .bind(now)
        .bind(expected_return)
        .execute(&mut *tx)
        .await;
    }

    if let Err(e) = tx.commit().await {
        return HttpResponse::InternalServerError().json(json!({"error": e.to_string()}));
    }

    HttpResponse::Ok().json(json!({
        "message": "Checkout successful",
        "books_checked": body.book_ids.len(),
        "expected_return": expected_return.format("%Y-%m-%d").to_string()
    }))
}

// ── Member: Borrowed Books ─────────────────────────────────────────────

pub async fn borrowed_books(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let member_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let rows = sqlx::query_as::<_, BorrowLedger>(
        r#"SELECT l.id, l.book_id, l.member_id, l.borrow_date, l.expected_return,
                  l.actual_return, l.return_condition, b.name AS book_name
           FROM book_borrow_ledger l
           JOIN books b ON b.book_id = l.book_id
           WHERE l.member_id = $1 AND l.actual_return IS NULL
           ORDER BY l.borrow_date DESC"#,
    )
    .bind(member_id)
    .fetch_all(pool.get_ref())
    .await;

    match rows {
        Ok(ledgers) => {
            let result: Vec<_> = ledgers
                .into_iter()
                .map(|l| {
                    let is_overdue = now > l.expected_return;
                    json!({
                        "id": l.id,
                        "book_id": l.book_id,
                        "member_id": l.member_id,
                        "borrow_date": l.borrow_date.to_string(),
                        "expected_return": l.expected_return.to_string(),
                        "actual_return": l.actual_return.map(|d| d.to_string()),
                        "return_condition": l.return_condition,
                        "book_name": l.book_name,
                        "is_overdue": is_overdue,
                    })
                })
                .collect();
            HttpResponse::Ok().json(result)
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Member: Return Book ────────────────────────────────────────────────

pub async fn return_book(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    body: web::Json<ReturnRequest>,
) -> impl Responder {
    let member_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "UPDATE book_borrow_ledger SET actual_return = $1, return_condition = 'good' WHERE book_id = $2 AND member_id = $3 AND actual_return IS NULL",
    )
    .bind(now)
    .bind(body.book_id)
    .bind(member_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() == 0 => {
            HttpResponse::NotFound().json(json!({"error": "no active borrow record found"}))
        }
        Ok(_) => {
            let _ = sqlx::query("UPDATE books SET number_of_copies = number_of_copies + 1 WHERE book_id = $1")
                .bind(body.book_id)
                .execute(pool.get_ref())
                .await;
            HttpResponse::Ok().json(json!({"message": "Book returned successfully"}))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Librarian: List Books ──────────────────────────────────────────────

pub async fn list_books(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as::<_, Book>(
        "SELECT book_id, name, author, number_of_copies, publication_year, edition FROM books ORDER BY name",
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(books) => HttpResponse::Ok().json(books),
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Librarian: Add Book ────────────────────────────────────────────────

pub async fn add_book(
    pool: web::Data<PgPool>,
    body: web::Json<AddBookRequest>,
) -> impl Responder {
    let result = sqlx::query_scalar::<_, i32>(
        "INSERT INTO books (name, author, number_of_copies, publication_year, edition) VALUES ($1, $2, $3, $4, $5) RETURNING book_id",
    )
    .bind(&body.name)
    .bind(&body.author)
    .bind(body.number_of_copies)
    .bind(body.publication_year)
    .bind(&body.edition)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(book_id) => HttpResponse::Created().json(json!({
            "book_id": book_id,
            "message": "Book added successfully"
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}

// ── Librarian: Remove Book ─────────────────────────────────────────────

pub async fn remove_book(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let book_id = path.into_inner();

    let result = sqlx::query("DELETE FROM books WHERE book_id = $1")
        .bind(book_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(r) if r.rows_affected() == 0 => {
            HttpResponse::NotFound().json(json!({"error": "book not found"}))
        }
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Book removed successfully"})),
        Err(e) => HttpResponse::InternalServerError().json(json!({"error": e.to_string()})),
    }
}
