mod db;
mod handlers;
mod models;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware};
use sqlx::postgres::PgPoolOptions;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".into());
        let port = env::var("DB_PORT").unwrap_or_else(|_| "5432".into());
        let user = env::var("DB_USER").unwrap_or_else(|_| "library".into());
        let pass = env::var("DB_PASSWORD").unwrap_or_else(|_| "library".into());
        let name = env::var("DB_NAME").unwrap_or_else(|_| "library".into());
        format!("postgres://{}:{}@{}:{}/{}", user, pass, host, port, name)
    });

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres");

    log::info!("✔ Connected to PostgreSQL");

    db::migrate(&pool).await.expect("Migration failed");

    let listen_addr = env::var("LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".into());
    log::info!("🚀 Book Library API listening on {}", listen_addr);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_origin("http://localhost:5173")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_header(actix_web::http::header::CONTENT_TYPE)
            .supports_credentials();

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .wrap(middleware::Logger::default())
            // Member routes
            .route("/api/register", web::post().to(handlers::register))
            .route("/api/login", web::post().to(handlers::login))
            .route("/api/members/{member_id}/checkout", web::post().to(handlers::checkout))
            .route("/api/members/{member_id}/borrowed", web::get().to(handlers::borrowed_books))
            .route("/api/members/{member_id}/return", web::post().to(handlers::return_book))
            // Book / Librarian routes
            .route("/api/books", web::get().to(handlers::list_books))
            .route("/api/books", web::post().to(handlers::add_book))
            .route("/api/books/{book_id}", web::delete().to(handlers::remove_book))
    })
    .bind(&listen_addr)?
    .run()
    .await
}
