# AppScan AI Backend

AppScan AI is a Spring Boot backend for a research grant review demo. It accepts application submissions, enriches them with an AI-generated summary, calculates a rule-based score, stores the result in H2, and exposes JSON APIs for the React frontend.

## Features

- `POST /api/applications` validates and saves a funding application
- `GET /api/applications` returns submitted applications for the dashboard
- `GET /api/applications/{id}` returns a single application
- `GET /api/meta/*` returns reference data for frontend dropdowns
- AI summary generation through OpenRouter with graceful fallback when the key is missing or the provider is unavailable

## Tech Stack

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- H2 database

## Run Locally

1. Copy `.env.example` values into your local environment.
2. Set `OPENROUTER_API_KEY` if you want live AI summaries.
3. Run `mvnw.cmd spring-boot:run`

The app starts on `http://localhost:8080`.

## Environment Variables

- `OPENROUTER_API_KEY`: OpenRouter API key for AI summaries
- `APP_FRONTEND_URL`: frontend origin allowed by CORS, defaults to `http://localhost:3000`

## Notes

- The H2 database is file-based at `./data/appscandb`, so demo data persists across restarts on the same machine.
- If `OPENROUTER_API_KEY` is not set, submissions still work and save with a fallback summary.
