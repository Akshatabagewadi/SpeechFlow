# SpeechFlow API

Spring Boot 3 REST API for transcription CRUD.

## Run
1. Install Java 17+ and Maven 3.9+.
2. Create the `speechflow` MySQL database using `../database/schema.sql`.
3. Export `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and optionally `CORS_ALLOWED_ORIGINS` as described in the root README.
4. From this directory run `mvn test` and then `mvn spring-boot:run`.

Endpoints are rooted at `/api/transcriptions`. `GET` supports an optional `search` query parameter. The API uses DTO validation and returns JSON error objects for invalid requests and missing records.
