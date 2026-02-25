use sqlx::PgPool;
use log::info;

pub async fn migrate(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"CREATE TABLE IF NOT EXISTS books (
            book_id          SERIAL PRIMARY KEY,
            name             TEXT NOT NULL,
            author           TEXT NOT NULL,
            number_of_copies INTEGER NOT NULL DEFAULT 0,
            publication_year INTEGER,
            edition          TEXT
        )"#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"CREATE TABLE IF NOT EXISTS members (
            member_id SERIAL PRIMARY KEY,
            name      TEXT NOT NULL,
            address   TEXT,
            age       INTEGER,
            email     TEXT UNIQUE NOT NULL
        )"#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"CREATE TABLE IF NOT EXISTS book_borrow_ledger (
            id               SERIAL PRIMARY KEY,
            book_id          INTEGER NOT NULL REFERENCES books(book_id),
            member_id        INTEGER NOT NULL REFERENCES members(member_id),
            borrow_date      TIMESTAMP NOT NULL DEFAULT NOW(),
            expected_return  TIMESTAMP NOT NULL,
            actual_return    TIMESTAMP,
            return_condition TEXT
        )"#,
    )
    .execute(pool)
    .await?;

    info!("✔ Database schema migrated");
    Ok(())
}
