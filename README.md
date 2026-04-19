# AppScan AI — Intelligent Research Application Review System

## Problem
Research program coordinators spend hours manually reading through incoming grant applications — extracting key details, checking eligibility, and flagging incomplete entries by hand. This is slow, inconsistent, and unscalable.

## Solution
AppScan AI is a full-stack web application that automates grant application intake. Coordinators submit applications and instantly receive AI-generated summaries, eligibility scores, and structured review data — eliminating manual reading entirely.

## System Architecture
AppScan AI is Part 3 of an integrated research data pipeline:
- **DataGuard** → validates and cleans bulk application data
- **GrantViz** → Power BI dashboard built on DataGuard's clean output
- **AppScan AI** → handles real-time incoming submissions with AI review

## Features
- AI-generated summary for every submission via OpenRouter API
- Rule-based eligibility scoring (0-100) calculated locally
- Automatic eligibility status — APPROVED or REVIEW
- Graceful fallback if AI unavailable — application always saved
- Full REST API with CRUD support
- File-based H2 database — data persists across restarts

## Validation Rules
- Applicant name is required
- Valid email format required
- Funding amount must be greater than zero
- Funding <= $150,000 → APPROVED
- Funding > $150,000 → REVIEW

## How to Run
1. Set your environment variables:

OPENROUTER_API_KEY=your-key-here
APP_FRONTEND_URL=http://localhost:3000

2. Run the backend: .\mvnw.cmd spring-boot:run
3. Backend runs at http://localhost:8080

## API Reference

### Submit application
`POST /api/applications`
```json
{
  "applicantName": "Dr. Sarah Chen",
  "email": "sarah.chen@msu.edu",
  "department": "AgBioResearch",
  "projectTitle": "Soil Microbiome Analysis for Crop Yield",
  "fundingRequested": 45000
}
```

### Get all applications
`GET /api/applications`

### Get one application
`GET /api/applications/{id}`

### Metadata endpoints
- `GET /api/meta/applicants`
- `GET /api/meta/departments`
- `GET /api/meta/projects`

## Output Fields
| Field | Description |
|---|---|
| aiSummary | AI-generated 3-point summary of the submission |
| aiScore | Rule-based score 0-100 |
| eligibilityStatus | APPROVED or REVIEW |

## H2 Database Console
Available at `http://localhost:8080/h2-console` while app is running.

## Database
File-based H2 database — data persists across restarts.
Console available locally at `/h2-console` while app is running.

## Development Notes
### v1.0 → v2.0 Improvements
| Issue Found | Fix Applied |
|---|---|
| AI failure crashed submission | Added graceful fallback — application always saved |
| Hardcoded CORS origin | Moved to APP_FRONTEND_URL environment variable |
| No eligibility logic | Added rule-based scoring and APPROVED/REVIEW status |
| No metadata endpoints | Added /api/meta/* endpoints for frontend dropdowns |
| API key hardcoded in properties | Moved to environment variable OPENROUTER_API_KEY |

## Roadmap
- React frontend with submission form and dashboard
- Docker support for easy deployment
- Replace H2 with PostgreSQL for production
- Authentication and role-based access control

## Technologies
Java · Spring Boot 3.2 · Spring Data JPA · H2 · OpenRouter API · REST · Maven
