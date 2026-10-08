# Bulk Certificate Generator

A scalable backend service for generating certificates in bulk. The application accepts a list of recipients, validates the data, creates certificates in the background, tracks the generation progress, handles individual failures, and allows generated certificates to be retrieved.

## Technology Stack

- Python 3.11+
- FastAPI
- PostgreSQL
- SQLAlchemy
- Redis
- ARQ
- ReportLab
- Pytest
- Docker
- Docker Compose
- Alembic

---

## 1. Project Setup

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Docker
- Docker Compose
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd bulk-certificate-generator
```

### Create Environment File

```bash
cp .env.example .env
```

Update the `.env` file if required.

Example:

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

### Option 1: Using Docker

Build and start the application:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

ReDoc documentation:

```text
http://localhost:8000/redoc
```

The Docker setup runs the required services:

- FastAPI application
- PostgreSQL
- Redis
- Background worker

To stop the application:

```bash
docker compose down
```

### Option 2: Run Locally

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```bash
cp .env.example .env
```

Start the FastAPI application:

```bash
uvicorn app.main:app --reload
```

In another terminal, start the background worker:

```bash
arq app.workers.worker.WorkerSettings
```

The API will be available at:

```text
http://localhost:8000
```

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

Run all tests:

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

The test suite covers:

- Creating a generation job
- Input validation
- Certificate generation
- Job status and progress
- Individual certificate failure handling
- Certificate retrieval
- Idempotency

---

## 5. How to Submit a Certificate Generation Request

The application exposes:

```http
POST /api/v1/certificate-jobs
```

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

### Response

The API immediately returns a job ID instead of waiting for all certificates to be generated.

```json
{
  "job_id": "9a0c7d9a-1234-4567-8901-abcdef123456",
  "status": "PENDING",
  "total_count": 2
}
```

HTTP status:

```text
202 Accepted
```

The returned `job_id` is used to track the certificate generation process.

---

## 6. Check Certificate Generation Status

Use the job ID returned from the generation request.

```http
GET /api/v1/certificate-jobs/{job_id}
```

Example:

```bash
curl \
  http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456
```

Example response:

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

Possible job statuses:

```text
PENDING
PROCESSING
COMPLETED
COMPLETED_WITH_ERRORS
FAILED
```

Each certificate also has its own status:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

For example:

```text
Certificate 1 -> COMPLETED
Certificate 2 -> COMPLETED
Certificate 3 -> FAILED
Certificate 4 -> COMPLETED
Certificate 5 -> COMPLETED
```

If one certificate fails, the remaining certificates continue processing.

---

## 7. How to Retrieve Generated Certificates

### List Certificates for a Job

```http
GET /api/v1/certificate-jobs/{job_id}/certificates
```

Example:

```bash
curl \
  http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456/certificates
```

### Pagination

```http
GET /api/v1/certificate-jobs/{job_id}/certificates?page=1&page_size=50
```

Example response:

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

```http
GET /api/v1/certificate-jobs/{job_id}/certificates/{certificate_id}
```

Example:

```bash
curl \
  http://localhost:8000/api/v1/certificate-jobs/9a0c7d9a-1234-4567-8901-abcdef123456/certificates/certificate-id
```

Completed certificates can be retrieved from the configured storage.

---

# 8. Important Implementation and Design Decisions

## Asynchronous Processing

Certificate generation can take significant time when a request contains hundreds or thousands of recipients.

Processing all certificates inside the HTTP request would keep the connection open for a long time.

Instead, the application uses background processing.

```text
Client
  |
  | POST certificate generation request
  v
FastAPI
  |
  | Validate request
  v
Create Job
  |
  | Return 202 Accepted
  v
Redis Queue
  |
  v
Background Worker
  |
  v
Generate Certificates
  |
  v
Store Certificates
```

The client receives a `job_id` immediately and can use it to check progress.

### Why this approach?

- Keeps the API responsive
- Handles large requests better
- Allows workers to scale independently
- Prevents long-running HTTP requests
- Provides better failure isolation

## Bulk Processing

The API accepts multiple recipients in one request.

Instead of:

```text
POST /certificate
POST /certificate
POST /certificate
...
```

the client can submit:

```text
POST /certificate-jobs
```

with many recipients.

For large requests, certificates can be processed in batches.

Example:

```text
10,000 recipients

Batch 1  -> 500
Batch 2  -> 500
Batch 3  -> 500
...
Batch 20 -> 500
```

This helps control memory usage and improves progress tracking.

## Failure Isolation

Each certificate is processed independently.

For example:

```text
1000 recipients

990 -> SUCCESS
10  -> FAILED
```

The failed certificates are recorded with an error message, while the remaining valid certificates continue processing.

The final job status becomes:

```text
COMPLETED_WITH_ERRORS
```

This prevents one invalid recipient from stopping the complete generation job.

## Job Tracking

The application tracks both job-level and certificate-level information.

A generation job contains:

```text
job_id
status
total_count
processed_count
success_count
failure_count
created_at
started_at
completed_at
```

Each certificate contains:

```text
certificate_id
job_id
recipient_name
recipient_email
status
storage_key
error_message
attempt_count
created_at
completed_at
```

This allows the client to understand:

- How many certificates were requested
- How many were processed
- How many succeeded
- How many failed
- Current generation progress

## Idempotency

Bulk requests can be retried because of network failures or client timeouts.

For example:

```text
Client
   |
   | POST request
   |
   X
Network timeout
```

The client may not know whether the server already created the job.

Without idempotency:

```text
Request 1 -> Job A -> 1000 certificates
Request 2 -> Job B -> 1000 duplicate certificates
```

To avoid this, the API supports:

```http
Idempotency-Key: abc123
```

Example:

```text
Request A + Key X -> Job 1
Request A + Key X -> Job 1
```

The second request returns the existing job instead of creating a duplicate job.

The request hash is also stored so the same idempotency key cannot be reused with a different request payload.

## Retry Handling

Some failures are temporary and can be retried.

Example:

```text
Attempt 1 -> Failed
Attempt 2 -> Failed
Attempt 3 -> Success
```

Retryable failures can include temporary infrastructure or storage problems.

Permanent validation failures should not be repeatedly retried.

For example:

```text
Invalid email
Missing recipient name
Invalid request data
```

These should be marked as failed immediately.

## Database Design

PostgreSQL is used because the application requires relational data, transactions, and consistent job/certificate state.

The main relationship is:

```text
Generation Job
      |
      | 1
      |
      | N
      |
Certificate
```

One generation job can contain many certificates.

This allows the system to track every certificate independently while maintaining an overall job status.

## Certificate Generation

ReportLab is used to generate the certificate PDF.

Each generated certificate contains recipient-specific information.

Example:

```text
Certificate of Completion

This certificate is proudly presented to

John Doe

for successfully completing the program.
```

The certificate template is predefined as required by the assignment.

## Storage Abstraction

Generated certificates are handled through a storage abstraction instead of directly coupling the business logic to a storage provider.

```text
Certificate Service
       |
       v
Storage Interface
       |
       +---- Local Storage
       |
       +---- S3 Storage
```

Local storage can be used during development.

Amazon S3 or another object storage service can be used in production.

This makes it possible to change the storage implementation without changing the certificate-generation business logic.

## Clean Architecture

The application separates responsibilities between different layers.

```text
API
 |
 v
Service
 |
 v
Repository
 |
 v
Database
```

### API Layer

Responsible for:

- HTTP requests
- HTTP responses
- Request validation
- API routing

### Service Layer

Responsible for:

- Business logic
- Job creation
- Certificate processing
- Failure handling

### Repository Layer

Responsible for:

- Database operations
- Queries
- Persistence

### Worker Layer

Responsible for:

- Background processing
- Certificate generation
- Updating job progress

### Storage Layer

Responsible for:

- Saving certificates
- Retrieving certificates

This separation improves maintainability, testing, and future development.

## Scalability

The API and background workers are separated so they can scale independently.

```text
                 Load Balancer
                      |
          +-----------+-----------+
          |           |           |
        API 1       API 2       API 3
          |           |           |
          +-----------+-----------+
                      |
                    Redis
                      |
          +-----------+-----------+
          |           |           |
       Worker 1   Worker 2   Worker 3
```

If certificate generation becomes CPU-intensive, more workers can be added without unnecessarily increasing the API instances.

## Error Handling

The API returns appropriate HTTP status codes.

Common responses include:

```text
400 Bad Request
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Example:

```json
{
  "detail": "Job not found"
}
```

Internal implementation details are not exposed to API clients.

## Testing Strategy

The test suite covers the important application requirements.

### Job Creation

Verify that a valid request:

```text
POST request
     |
     v
Job created
     |
     v
202 Accepted
```

### Input Validation

Tests include:

- Empty recipient list
- Missing recipient name
- Invalid email
- Invalid request payload

### Certificate Generation

Verify that a valid recipient produces a certificate PDF.

### Job Progress

Verify that processed, successful, and failed certificate counts are correctly reflected in the job status.

### Individual Certificate Failure

Verify that:

```text
Certificate A -> SUCCESS
Certificate B -> FAILURE
Certificate C -> SUCCESS
```

does not stop Certificate C from being processed.

### Certificate Retrieval

Verify that successfully generated certificates can be retrieved.

### Idempotency

Verify that:

```text
Request A + Key X -> Job 1
Request A + Key X -> Job 1
```

does not create duplicate jobs.

Also verify that using the same idempotency key with a different request is rejected.

---

## Project Structure

```text
bulk-certificate-generator/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── jobs.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   │
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── certificate.py
│   │   └── job.py
│   │
│   ├── repositories/
│   │   ├── certificate_repository.py
│   │   └── job_repository.py
│   │
│   ├── schemas/
│   │   ├── certificate.py
│   │   └── job.py
│   │
│   ├── services/
│   │   ├── certificate_service.py
│   │   ├── job_service.py
│   │   └── storage.py
│   │
│   ├── workers/
│   │   └── worker.py
│   │
│   └── main.py
│
├── tests/
│   ├── test_health.py
│   ├── test_validation.py
│   ├── test_jobs.py
│   └── test_certificate_generation.py
│
├── alembic/
│
├── templates/
│   └── certificate_template.html
│
├── storage/
│
├── .env.example
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Summary

The complete flow of the application is:

```text
1. Client submits a bulk certificate request
2. API validates the request
3. Generation job is created in PostgreSQL
4. API returns 202 Accepted with a job_id
5. Job is sent to the background queue
6. Worker processes certificates asynchronously
7. Each certificate is tracked independently
8. Failed certificates do not stop successful certificates
9. Job progress is updated
10. Generated certificates are stored
11. Client checks job status
12. Client retrieves generated certificates
```

The design focuses on:

- Scalability
- Reliability
- Failure isolation
- Asynchronous processing
- Clean API design
- Maintainability
- Testability
- Idempotency
- Clear separation of responsibilities
