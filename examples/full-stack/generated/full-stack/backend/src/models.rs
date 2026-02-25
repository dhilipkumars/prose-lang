use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

// ── Book ────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Book {
    pub book_id: i32,
    pub name: String,
    pub author: String,
    pub number_of_copies: i32,
    pub publication_year: Option<i32>,
    pub edition: Option<String>,
}

// ── Member ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Member {
    pub member_id: i32,
    pub name: String,
    pub address: Option<String>,
    pub age: Option<i32>,
    pub email: String,
}

// ── Borrow Ledger ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BorrowLedger {
    pub id: i32,
    pub book_id: i32,
    pub member_id: i32,
    pub borrow_date: NaiveDateTime,
    pub expected_return: NaiveDateTime,
    pub actual_return: Option<NaiveDateTime>,
    pub return_condition: Option<String>,
    #[sqlx(default)]
    pub book_name: Option<String>,
}

// ── Request DTOs ────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub first_name: String,
    pub last_name: String,
    pub age: i32,
    pub email: String,
    pub address: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub member_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct CheckoutRequest {
    pub book_ids: Vec<i32>,
}

#[derive(Debug, Deserialize)]
pub struct ReturnRequest {
    pub book_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct AddBookRequest {
    pub name: String,
    pub author: String,
    pub number_of_copies: i32,
    pub publication_year: Option<i32>,
    pub edition: Option<String>,
}
