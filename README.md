# Bulk Certificate Generator

A scalable full-stack application for generating certificates in bulk. The application features a React frontend and a FastAPI backend that accepts a list of recipients, validates the data, creates certificates in the background, tracks generation progress in real time, handles individual failures, and allows generated certificates to be retrieved.

---

## Technology Stack

### Frontend
* React (TypeScript)
* Vite (Serving on port `5173`)
* CSS / Tailwind CSS

### Backend & Infrastructure
* Python 3.11+
* FastAPI
* PostgreSQL & SQLAlchemy
* Alembic (Database Migrations)
* Redis & ARQ (Asynchronous Task Queue)
* ReportLab (PDF Generation)
* Pytest
* Docker & Docker Compose

---

## 1. Project Setup

### Prerequisites
Make sure the following are installed:
* Python 3.11+
* Node.js (v18+ recommended) & npm
* Docker & Docker Compose
* Git

### Clone the Repository
```bash
git clone <repository-url>
cd bulk-certificate-generator
```

### Create Environment File
```bash
cp .env.example .env
```

Update the `.env` file if required. Example configuration:
```env
APP_NAME=Bulk Certificate Generator
ENVIRONMENT=development

DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/certificates
REDIS_URL=redis://redis:6379/0

STORAGE_BACKEND=local
STORAGE_PATH=./storage

MAX_RETRIES=3
BATCH_SIZE=100
```

---

## 2. How to Run the Application

### Option 1: Using Docker (Recommended)
Build and start all services (Frontend, FastAPI, PostgreSQL, Redis, and Background Worker):
```bash
docker compose up --build
```

Once running, the services will be available at:
* **Frontend UI:** `http://localhost:5173`
* **Backend API:** `http://localhost:8000`
* **Swagger API Documentation:** `http://localhost:8000/docs`
* **ReDoc Documentation:** `http://localhost:8000/redoc`

To stop the application:
```bash
docker compose down
```

### Option 2: Run Locally

#### 1. Start the Backend API & Worker
Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# .venv\Scripts\activate   # On Windows
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI application:
```bash
uvicorn app.main:app --reload
```

In a second terminal, start the ARQ background worker:
```bash
arq app.workers.worker.WorkerSettings
```

#### 2. Start the Frontend
In a third terminal, navigate to the `frontend` directory, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

The frontend application will be live at:
* `http://localhost:5173`

---

## 3. Database Setup

The application uses PostgreSQL for storing generation jobs and certificate information.

Run database migrations:
```bash
alembic upgrade head
```

To create a new migration after changing the database models:
```bash
alembic revision --autogenerate -m "update database schema"
```

To rollback the latest migration:
```bash
alembic downgrade -1
```

---

## 4. How to Run Tests

Run all backend tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app
```

Run a specific test file:
```bash
pytest tests/test_validation.py
```

**The test suite covers:**
* Creating a generation job
* Input validation
* Certificate generation
* Job status and progress
* Individual certificate failure handling
* Certificate retrieval
* Idempotency

---

## 5. How to Submit a Certificate Generation Request

You can submit requests directly through the **Frontend UI** at `http://localhost:5173` or via the REST API:

**Endpoint:** `POST /api/v1/certificate-jobs`

### Request Headers
```http
Content-Type: application/json
Idempotency-Key: unique-request-key
```

### Request Body
```json
{
  "template_name": "default",
  "recipients": [
    {
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  ]
}
```

### Using cURL
```bash
curl -X POST \
  http://localhost:8000/api/v1/certificate-jobs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-request-001" \
  -d '{
    "template_name": "default",
    "recipients": [
      {
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    ]
  }'
```

### Response (`202 Accepted`)
The API immediately returns a `job_id` instead of waiting for all certificates to be generated:
```json
{
  "job_id": "9a0c7d9a-1234-4567-8901-abcdef123456",
  "status": "PENDING",
  "total_count": 2
}
```

---

## 6. Check Certificate Generation Status

Use the `job_id` returned from the generation request.

**Endpoint:** `GET /api/v1/certificate-jobs/{job_id}`

### Example cURL
```bash
curl http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456
```

### Example Response
```json
{
  "job_id": "9a0c7d9a-1234-4567-8901-abcdef123456",
  "status": "PROCESSING",
  "total_count": 1000,
  "processed_count": 650,
  "success_count": 640,
  "failure_count": 10,
  "progress_percentage": 65.0
}
```

**Possible Job Statuses:**
* `PENDING`
* `PROCESSING`
* `COMPLETED`
* `COMPLETED_WITH_ERRORS`
* `FAILED`

**Possible Individual Certificate Statuses:**
* `PENDING`
* `PROCESSING`
* `COMPLETED`
* `FAILED`

If one certificate fails, the remaining certificates continue processing without interruption.

---

## 7. How to Retrieve Generated Certificates

### List Certificates for a Job
**Endpoint:** `GET /api/v1/certificate-jobs/{job_id}/certificates?page=1&page_size=50`

```bash
curl "http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456/certificates?page=1&page_size=50"
```

**Example Response:**
```json
{
  "items": [
    {
      "id": "certificate-id",
      "recipient_name": "John Doe",
      "status": "COMPLETED",
      "storage_key": "job-id/certificate-id.pdf"
    }
  ],
  "page": 1,
  "page_size": 50,
  "total": 2
}
```

### Retrieve a Specific Certificate
**Endpoint:** `GET /api/v1/certificate-jobs/{job_id}/certificates/{certificate_id}`

```bash
curl http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456/certificates/certificate-id
```

---

## 8. Important Implementation and Design Decisions

### Asynchronous Processing
Certificate generation can take significant time when a request contains hundreds or thousands of recipients. Instead of blocking the HTTP request, the application offloads work to a background queue:

```text
React Frontend (Port 5173) / Client
  │
  │ POST certificate generation request
  ▼
FastAPI (Port 8000)
  │
  │ Validate request & Create Job
  ▼
Return 202 Accepted (with job_id)
  │
  ▼
Redis Queue
  │
  ▼
ARQ Background Worker
  │
  ▼
Generate Certificates (ReportLab) & Save to Storage
```

### Bulk Processing & Failure Isolation
* **Batching:** Large recipient lists are processed in configurable batches to control memory usage and maintain granular progress tracking.
* **Isolation:** Each certificate is processed independently. If 10 out of 1,000 recipients fail, the 990 valid certificates still succeed and the job concludes with `COMPLETED_WITH_ERRORS`.

### Idempotency
To prevent duplicate jobs caused by network timeouts or client retries, the API enforces an `Idempotency-Key` header alongside a stored payload hash. Retrying an identical request with the same key returns the existing job, while reusing a key with a modified payload is rejected (`409 Conflict`).

### Clean Architecture & Storage Abstraction
* **Layered Backend:** Responsibilities are strictly divided across **API**, **Service**, **Repository**, **Worker**, and **Storage** layers.
* **Storage Interface:** Business logic interacts with an abstract storage interface, allowing seamless switching between local disk storage (`./storage`) in development and Amazon S3 in production.

---

## 9. Project Structure

```text
bulk-certificate-generator/
│
├── frontend/                  # React + TypeScript Frontend (Port 5173)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── app/                       # FastAPI Backend (Port 8000)
│   ├── api/
│   │   └── v1/
│   │       └── jobs.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── certificate.py
│   │   └── job.py
│   ├── repositories/
│   │   ├── certificate_repository.py
│   │   └── job_repository.py
│   ├── schemas/
│   │   ├── certificate.py
│   │   └── job.py
│   ├── services/
│   │   ├── certificate_service.py
│   │   ├── job_service.py
│   │   └── storage.py
│   ├── workers/
│   │   └── worker.py
│   └── main.py
│
├── tests/
│   ├── test_health.py
│   ├── test_validation.py
│   ├── test_jobs.py
│   └── test_certificate_generation.py
│
├── alembic/
├── storage/
├── .env.example
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── pytest.ini
├── requirements.txt
└── README.md
```
