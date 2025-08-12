 # Running the App with Docker

 This guide explains how to set up and run both the backend and frontend using Docker and Docker Compose.

 ## Prerequisites
  - Docker Engine (>= 20.10)
  - Docker Compose (plugin v2 or standalone >= 2.0)

 ## 1. Setup
 1. Copy the example environment file and adjust as needed:
    ```bash
    cp .env.example .env
    ```
 2. Edit the `.env` file to configure your:
    - DOMAIN, STACK_NAME
    - SECRET_KEY, FIRST_SUPERUSER, FIRST_SUPERUSER_PASSWORD
    - PostgreSQL connection variables (`POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`)
    - SMTP and email settings if sending emails

 ## 2. Create the Traefik Network (once)
 The Traefik proxy requires a Docker network named `traefik-public`:
 ```bash
 docker network create traefik-public || true
 ```

 ## 3. Development Mode
 Use the development override (`docker-compose.override.yml`) with live reload:
 ```bash
 docker compose watch
 ```

 This command builds (if needed) and starts the following services:
  - `proxy`: Traefik (ports 80, 8090)
  - `db`: PostgreSQL (port 5432)
  - `adminer`: Adminer (port 8080)
  - `mailcatcher`: MailCatcher (ports 1080, 1025)
  - `backend`: FastAPI (port 8000)
  - `frontend`: React (port 5173)
  - `playwright`: End-to-end tests (port 9323)

 Accessible endpoints:
  - Frontend: http://localhost:5173
  - Backend API: http://localhost:8000
    - Swagger UI: http://localhost:8000/docs
    - ReDoc: http://localhost:8000/redoc
  - Adminer: http://localhost:8080
  - Traefik Dashboard: http://localhost:8090
  - MailCatcher: http://localhost:1080

 ## 4. Production Mode
 Use only the primary Docker Compose file (no overrides):
 ```bash
 docker compose -f docker-compose.yml up -d --build
 ```

 This starts:
  - `db`, `prestart`, `backend`, `frontend`, `adminer` behind an external Traefik proxy.

 ## 5. Stopping and Cleaning Up
  - Stop services:
    ```bash
    docker compose down
    ```
  - Remove volumes (if needed):
    ```bash
    docker compose down -v
    ```

 ## 6. Viewing Logs
  - All services:
    ```bash
    docker compose logs -f
    ```
  - Single service (e.g., backend):
    ```bash
    docker compose logs -f backend
    ```

 ## Further Reading
  - [Local Development (with Docker)](./development.md)
  - [Production Deployment](./deployment.md)