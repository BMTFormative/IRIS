# Running the App Locally (Without Docker)

This guide explains how to set up and run both the backend and frontend locally, without using Docker.

## Prerequisites
  - Python 3.10 or newer
  - Node.js 18 or newer and npm
  - PostgreSQL (ensure it is installed and running)

## 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

## 2. Configure Environment Variables
1. Ensure the `.env` file at the project root contains the correct values for local development. Example:
   ```dotenv
   # Domain and hosts
   DOMAIN=localhost
   FRONTEND_HOST=http://localhost:5173
   ENVIRONMENT=local

   # Backend secrets and superuser
   SECRET_KEY=<your-secret-key>
   FIRST_SUPERUSER=admin@example.com
   FIRST_SUPERUSER_PASSWORD=admin123

   # PostgreSQL connection
   POSTGRES_SERVER=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=IRIS
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   ```
2. In the `frontend` folder, verify (or create) `frontend/.env` with at least:
   ```dotenv
   VITE_API_URL=http://localhost:8000
   MAILCATCHER_HOST=http://localhost:1080
   ```

## 3. Setup and Run PostgreSQL
- Start the PostgreSQL service:
  ```bash
  # Linux (systemd)
  sudo systemctl start postgresql
  # macOS (Homebrew)
  brew services start postgresql
  ```
- Create the application database:
  ```bash
  psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB;"
  ```

## 4. Backend Setup
```bash
cd backend
# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

  # Upgrade pip and install dependencies
pip install --upgrade pip
pip install .
  
  # (Optional) Install development dependencies for testing, linting, and type-checking
  pip install pytest mypy ruff pre-commit types-passlib coverage

# Run migrations and seed initial data
bash scripts/prestart.sh

# Start the backend server
# Option A: using uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Option B: using FastAPI CLI (if available)
fastapi run --reload app/main.py
```

The API will be available at http://localhost:8000

## 5. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# (Optional) Generate client from OpenAPI schema
npm run generate-client

# Start the frontend development server
npm run dev
```

The frontend will be available at http://localhost:5173

## 6. Verify Everything Works
- Frontend: http://localhost:5173
- Backend Swagger UI: http://localhost:8000/docs
- Backend ReDoc: http://localhost:8000/redoc
- MailCatcher (if SMTP configured): http://localhost:1080