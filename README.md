# AppScan

AppScan is a full-stack grant application review project. The backend is a Spring Boot API that accepts research grant applications, enriches them with an AI-generated summary, calculates a rule-based score, stores records in H2, and exposes endpoints for a frontend dashboard and submission flow.

## Project Status

The backend source is present in this repository and runnable.

The frontend is referenced by the backend configuration and CORS setup, but no frontend source files are currently checked into this workspace. There is an empty `frontend/` directory, so this README documents:
- the working backend
- the intended frontend integration points
- the expected local full-stack setup

## Repository Structure

```text
appscan/
├─ src/
│  ├─ main/
│  │  ├─ java/com/abr/appscan/
│  │  └─ resources/application.properties
│  └─ test/java/com/abr/appscan/
├─ data/
│  └─ appscandb.mv.db
├─ frontend/                  # currently empty
├─ .env.example
├─ pom.xml
├─ mvnw
├─ mvnw.cmd
└─ README.md
Note: there is also a nested appscan/ directory in this workspace that appears to be a duplicate copy of the backend project and is not required for running the root application.
Architecture
Backend
The backend provides:
•
application submission API
•
application listing and detail API
•
metadata endpoints for frontend dropdowns
•
AI summary generation through OpenRouter
•
rule-based scoring and eligibility evaluation
•
file-based H2 persistence
Frontend
The intended frontend behavior is:
•
collect grant application data from users
•
call backend metadata endpoints to populate dropdowns
•
submit applications to the backend
•
display saved applications, AI summaries, scores, and eligibility results
Tech Stack
Backend
•
Java 17
•
Spring Boot 4
•
Spring Web MVC
•
Spring Data JPA
•
H2 Database
•
Maven
Frontend
•
Frontend app expected at http://localhost:3000
•
Backend CORS is configured for a frontend origin via APP_FRONTEND_URL
•
No frontend package or source code is currently included in this repo
Backend Features
•
POST /api/applications validates and saves a grant application
•
GET /api/applications returns all saved applications
•
GET /api/applications/{id} returns one application by id
•
GET /api/meta/applicants returns sample applicant names
•
GET /api/meta/departments returns sample departments
•
GET /api/meta/projects returns sample project titles
•
AI summary generation uses OpenRouter when an API key is configured
•
graceful fallback summary is used if AI is unavailable
•
rule-based scoring returns a value up to 100
•
eligibility is marked:
◦
APPROVED when funding requested is <= 150000
◦
REVIEW when funding requested is > 150000
Data Model
Each application includes:
•
id
•
applicantName
•
email
•
department
•
projectTitle
•
fundingRequested
•
aiSummary
•
aiScore
•
eligibilityStatus
Validation Rules
The backend currently enforces:
•
valid email format
•
funding amount must be greater than zero
•
applicant name is required
If validation fails, the API returns 400 Bad Request.
AI Integration
AppScan can generate a short review summary using OpenRouter.
Expected behavior:
•
if OPENROUTER_API_KEY is set, the backend requests an AI summary
•
if the key is missing or the provider fails, the backend still saves the application with a fallback summary
•
the score is always generated locally using backend rules
Environment Variables
Create local environment variables from .env.example.
Required for optional AI summaries
•
OPENROUTER_API_KEY=replace-with-your-openrouter-key
Required for frontend/backend local integration
•
APP_FRONTEND_URL=http://localhost:3000
Backend Configuration
Important backend settings from application.properties:
•
server port: 8080
•
H2 database path: ./data/appscandb
•
H2 console enabled
•
JPA schema mode: update
•
frontend CORS origin comes from APP_FRONTEND_URL
Running the Backend
Windows
.\mvnw.cmd spring-boot:run
macOS/Linux
./mvnw spring-boot:run
Backend runs at:
http://localhost:8080
Running Tests
Windows
.\mvnw.cmd test
macOS/Linux
./mvnw test
H2 Database
The application uses a file-based H2 database, so data persists across restarts on the same machine.
Database file:
./data/appscandb
If enabled locally, the H2 console is typically available through the Spring Boot H2 console path while the app is running.
API Reference
Submit an application
POST /api/applications
Example request:
{
  "applicantName": "Alice Johnson",
  "email": "alice@example.com",
  "department": "Computer Science",
  "projectTitle": "AI-Driven Climate Modeling",
  "fundingRequested": 75000
}
Example response:
{
  "id": 1,
  "applicantName": "Alice Johnson",
  "email": "alice@example.com",
  "department": "Computer Science",
  "projectTitle": "AI-Driven Climate Modeling",
  "fundingRequested": 75000.0,
  "aiSummary": "- Summary: ...",
  "aiScore": 95,
  "eligibilityStatus": "APPROVED"
}
Get all applications
GET /api/applications
Get one application
GET /api/applications/{id}
Get frontend dropdown metadata
•
GET /api/meta/applicants
•
GET /api/meta/departments
•
GET /api/meta/projects
Frontend Integration Guide
When a frontend is added, it should:
1.
run on http://localhost:3000 by default, or update APP_FRONTEND_URL
2.
call the backend at http://localhost:8080
3.
use the metadata endpoints to populate form selects
4.
submit form data to POST /api/applications
5.
fetch saved applications from GET /api/applications
Recommended frontend screens:
•
application submission form
•
application list/dashboard
•
application detail view
Example Local Full-Stack Workflow
1.
Start the backend on port 8080
2.
Start the frontend on port 3000
3.
Open the frontend in the browser
4.
Load dropdown options from /api/meta/*
5.
Submit an application
6.
View AI summary, score, and eligibility returned by the backend
Current Gaps
•
frontend source code is not included in this repository
•
backend tests are minimal and only verify application startup
•
authentication and authorization are not implemented
•
database is local H2 only
•
no Docker setup is included
Future Improvements
•
add the missing frontend application
•
add API integration tests
•
add frontend form validation
•
add Docker support
•
replace H2 with PostgreSQL for production
•
add authentication and role-based access
•
improve scoring transparency and review rules
License
No license is currently defined in pom.xml or repository metadata.
