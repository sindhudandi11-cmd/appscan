# AppScan AI — Intelligent Research Application Review System

> A Spring Boot REST API that automates grant application intake using AI-generated summaries, rule-based eligibility scoring, and structured review data — eliminating manual reading for research coordinators.

📦 **[GitHub](https://github.com/sindhudandi11-cmd/appscan-ai)**

> **Current status:** v2.0 is a backend-only REST API. A React frontend is in development. Use the API directly via Postman or curl — see the API Reference below.

---

## Screenshots

![AppScan AI - Screenshot 1](https://raw.githubusercontent.com/sindhudandi11-cmd/appscan/main/screenshots/appscan-shot1.png)

![AppScan AI - Screenshot 2](https://raw.githubusercontent.com/sindhudandi11-cmd/appscan/main/screenshots/appscan-shot2.png)

![AppScan AI - Screenshot 3](https://raw.githubusercontent.com/sindhudandi11-cmd/appscan/main/screenshots/appscan-shot3.png)

---

## Problem

Research program coordinators spend hours manually reading through incoming grant applications — extracting key details, checking eligibility, and flagging incomplete entries by hand. This is slow, inconsistent, and unscalable.

## Solution

AppScan AI automates grant application intake. Coordinators submit applications and instantly receive an AI-generated summary, an eligibility score, and a structured APPROVED or REVIEW decision — eliminating manual reading entirely.

---

## System Architecture

AppScan AI is Part 3 of an integrated 3-system research data pipeline:

| System | Role | Repo |
|---|---|---|
| **DataGuard** | Validates and cleans bulk application data | [github.com/sindhudandi11-cmd/dataguard](https://github.com/sindhudandi11-cmd/dataguard) |
| **GrantViz** | Power BI dashboard built on DataGuard's clean output | [github.com/sindhudandi11-cmd/grantviz](https://github.com/sindhudandi11-cmd/grantviz) |
| **AppScan AI** | Handles real-time incoming submissions with AI review | This repo |

---

## Features

- AI-generated 3-point summary for every submission via OpenRouter API
- Rule-based eligibility scoring (0–100) calculated locally — no AI dependency for scoring
- Automatic eligibility status: APPROVED or REVIEW
- Graceful fallback if AI is unavailable — application is always saved
- Full REST API with CRUD support
- File-based H2 database — data persists across restarts

---

## Validation Rules

| Rule | Detail |
|---|---|
| Applicant name | Required — cannot be blank |
| Email | Must be a valid email format |
| Funding amount | Must be greater than zero |
| Funding ≤ $150,000 | → APPROVED |
| Funding > $150,000 | → REVIEW |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2, Spring Data JPA |
| Database | H2 (file-based, persists across restarts) |
| AI | OpenRouter API (LLM integration) |
| Build | Maven (wrapper included) |
| API Docs | REST — document via Postman or Swagger |

---

## Prerequisites

- Java 17 or higher
- Maven 3.6+ — or use the included Maven wrapper (no install needed)
- OpenRouter API key — [get one free here](https://openrouter.ai)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sindhudandi11-cmd/appscan-ai.git
cd appscan-ai
```

### 2. Set environment variables

```
OPENROUTER_API_KEY=your-key-here
APP_FRONTEND_URL=http://localhost:3000
```

### 3. Run the backend

**Mac / Linux:**
```bash
./mvnw spring-boot:run
```

**Windows:**
```bash
.\mvnw.cmd spring-boot:run
```

**With Maven installed directly:**
```bash
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`

---

## API Reference

### Submit an application
```
POST /api/applications
```
```json
{
  "applicantName": "Dr. Sarah Chen",
  "email": "sarah.chen@msu.edu",
  "department": "AgBioResearch",
  "projectTitle": "Soil Microbiome Analysis for Crop Yield",
  "fundingRequested": 45000
}
```

**Response:**
```json
{
  "id": 1,
  "applicantName": "Dr. Sarah Chen",
  "email": "sarah.chen@msu.edu",
  "department": "AgBioResearch",
  "projectTitle": "Soil Microbiome Analysis for Crop Yield",
  "fundingRequested": 45000,
  "aiSummary": "1. Proposal focuses on soil microbiome impact on crop yield. 2. Funding requested is within approved limits. 3. Department AgBioResearch has active research track record.",
  "aiScore": 82,
  "eligibilityStatus": "APPROVED"
}
```

### Get all applications
```
GET /api/applications
```

### Get one application
```
GET /api/applications/{id}
```

### Update an application
```
PUT /api/applications/{id}
```

### Delete an application
```
DELETE /api/applications/{id}
```

### Metadata endpoints
```
GET /api/meta/applicants     List of all applicant names
GET /api/meta/departments    List of all departments
GET /api/meta/projects       List of all project titles
```

---

## Output Fields

| Field | Description |
|---|---|
| `aiSummary` | AI-generated 3-point summary of the submission |
| `aiScore` | Rule-based eligibility score, 0–100 |
| `eligibilityStatus` | APPROVED (funding ≤ $150k) or REVIEW (funding > $150k) |

---

## Database

AppScan AI uses a file-based H2 database that persists data across restarts — no external database setup required.

**H2 console** (available while the app is running):
```
http://localhost:8080/h2-console
```

For production deployment, the data layer is designed to migrate to PostgreSQL with minimal service layer changes.

---

## Development Notes

### v1.0 → v2.0 Improvements

| Issue Found | Fix Applied |
|---|---|
| AI failure crashed the entire submission | Added graceful fallback — application always saved regardless of AI availability |
| CORS origin hardcoded in source code | Moved to `APP_FRONTEND_URL` environment variable |
| No eligibility logic | Added rule-based scoring (0–100) and APPROVED/REVIEW classification |
| No metadata endpoints | Added `/api/meta/*` endpoints for frontend dropdown population |
| API key hardcoded in `application.properties` | Moved to `OPENROUTER_API_KEY` environment variable |

---

## Known Limitations

- **No authentication in v2.0** — all submitted applications are visible to anyone with API access. Role-based access control is planned for v3.0.
- **H2 for development** — file-based H2 is used for local development. A PostgreSQL migration is planned before production deployment.
- **No frontend yet** — the React submission form and dashboard are on the roadmap for v3.0.

---

## Roadmap

- [ ] React frontend — submission form and review dashboard
- [ ] PostgreSQL migration for production
- [ ] Docker support for easy deployment
- [ ] Authentication and role-based access control (admin vs coordinator)

---

## Troubleshooting

**Port already in use** — change `server.port` in `src/main/resources/application.properties`:
```
server.port=8081
```

**OpenRouter API errors** — verify your API key has credits and is correctly set as an environment variable. The app will still save submissions if the AI call fails.

**H2 console not loading** — ensure the app is running and visit `http://localhost:8080/h2-console`. Check `application.properties` for the JDBC URL.

---

## Author

**Sindhu Dandibhatla** — [github.com/sindhudandi11-cmd](https://github.com/sindhudandi11-cmd) · [LinkedIn](https://www.linkedin.com/in/sindhudandi2/)

For bugs or feature requests, [open an issue](https://github.com/sindhudandi11-cmd/appscan-ai/issues).

---

*Licensed under the MIT License.*
