# Microservice Architecture Example

A more complex multi-container application that demonstrates a microservice architecture. It features two independent Java Spring Boot backend services (`m1` for Container Management, `m2` for Product Management) each with their own PostgreSQL database, and a single React frontend proxying requests to both.

**Compiled From:** `src/m1.prose`, `src/m2.prose`, `src/ui.prose`  
**Generated Stack:** Java (Spring Boot), React (Frontend), PostgreSQL (Database), Docker Compose  

![Microservice Dashboard](screenshot.png)

## Architecture

```mermaid
graph TD
    Client["Frontend (React UI)"]
    M1["Container API (m1)"]
    M2["Product API (m2)"]
    DB1[("Container DB (Port 5433)")]
    DB2[("Product DB (Port 5434)")]

    Client -->|HTTP REST (Port 8081)| M1
    Client -->|HTTP REST (Port 8082)| M2
    M1 -->|SQL| DB1
    M2 -->|SQL| DB2
```

## Getting Started

To run the full stack application, you need Docker installed.

```bash
cd generated
docker compose up --build -d
```

Once all containers are healthy, the integrated UI is accessible at `http://localhost:3000`. 

The backends have their own databases running on ports `5433` and `5434`, and their APIs isolated on `8081` and `8082`.
