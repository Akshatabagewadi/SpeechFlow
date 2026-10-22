# SpeechFlow — Real-Time Multilingual Speech-to-Text

SpeechFlow is a full-stack demo for browser-based speech recognition and searchable transcription history. The React/Vite frontend uses the browser Web Speech API when available; the Spring Boot REST API persists records in MySQL using Spring Data JPA.

## Features
- Live speech-to-text with start/stop, language selection, interim text, status and error messages.
- Save, copy, search, view, edit and delete transcriptions.
- Responsive dashboard and history view.
- REST API validation, DTOs, timestamps and global error handling.
- MySQL schema and environment-based credentials.
- Backend unit tests for service behavior.

## Architecture
`React + Vite` → REST/JSON → `Spring Boot controller → service → Spring Data JPA → MySQL`

Speech recognition runs in the user's browser and is intentionally separated behind `speechRecognition.js`. Browser implementations and language coverage vary; Chrome/Edge usually provide the best support. This starter does not call Gemini or another paid external speech API.

## Requirements
- Node.js 20+ and npm
- Java 17+
- Maven 3.9+ (or use a Maven wrapper if you add one)
- MySQL 8+

## Project structure
```text
speechflow/
  frontend/      React + Vite app
  backend/       Spring Boot REST API
  database/      SQL schema
  .gitignore
```

## 1. Configure MySQL
Create a database and user (or use an existing local MySQL account):
```sql
CREATE DATABASE speechflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'speechflow_user'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT ALL PRIVILEGES ON speechflow.* TO 'speechflow_user'@'localhost';
FLUSH PRIVILEGES;
```
You can also run `database/schema.sql` after creating the database. Hibernate uses `ddl-auto=update` for convenience in development.

## 2. Configure environment variables
Copy `backend/.env.example` to your own notes or export the variables in your terminal. Spring Boot does not automatically load `.env` files, so export them before launching:
- `DB_URL` (default `jdbc:mysql://localhost:3306/speechflow?useSSL=false&serverTimezone=UTC`)
- `DB_USERNAME` (default `speechflow_user`)
- `DB_PASSWORD` (required in your local environment)
- `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173`)

Windows PowerShell example:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/speechflow?useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME="speechflow_user"
$env:DB_PASSWORD="change_this_password"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
```
macOS/Linux:
```bash
export DB_URL='jdbc:mysql://localhost:3306/speechflow?useSSL=false&serverTimezone=UTC'
export DB_USERNAME='speechflow_user'
export DB_PASSWORD='change_this_password'
export CORS_ALLOWED_ORIGINS='http://localhost:5173'
```

## 3. Start backend
From `backend/`:
```bash
mvn spring-boot:run
```
API base URL: `http://localhost:8080/api/transcriptions`.

## 4. Start frontend
In another terminal, from `frontend/`:
```bash
npm install
npm run dev
```
Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:8080`.

## API examples
Create:
```bash
curl -X POST http://localhost:8080/api/transcriptions \
  -H "Content-Type: application/json" \
  -d '{"title":"Daily notes","content":"Hello, this is a test.","language":"en-US"}'
```
List/search:
```bash
curl "http://localhost:8080/api/transcriptions?search=hello"
```
Update:
```bash
curl -X PUT http://localhost:8080/api/transcriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated notes","content":"Updated text","language":"en-US"}'
```
Get one: `GET /api/transcriptions/1`
Delete: `DELETE /api/transcriptions/1`

Example response:
```json
{
  "id": 1,
  "title": "Daily notes",
  "content": "Hello, this is a test.",
  "language": "en-US",
  "createdAt": "2026-10-22T12:30:00",
  "updatedAt": "2026-10-22T12:30:00"
}
```

## Speech recognition
Choose a language before recording. The browser's `SpeechRecognition` / `webkitSpeechRecognition` implementation handles audio locally in the app integration layer, but some browsers may send audio to a vendor service under their own policies. Microphone access generally requires HTTPS or `localhost`. If unsupported, type/paste text and save it normally. Hindi is `hi-IN`; English is `en-US`; Hinglish is typically best attempted with Hindi or English selected, but automatic code-switching accuracy is not guaranteed.

## Tests and verification
Backend tests:
```bash
cd backend
mvn test
```
Frontend checks/build:
```bash
cd frontend
npm install
npm run build
```
The project source is packaged here; actual Maven/npm/MySQL execution depends on tools and services installed on your machine. Do not assume a database-backed CRUD test passed until MySQL is running and the app has been exercised locally.

## Troubleshooting
- **Cannot connect to MySQL:** verify MySQL is running, the database exists, and credentials match environment variables.
- **CORS errors:** set `CORS_ALLOWED_ORIGINS` to the frontend origin.
- **Microphone blocked:** grant browser permission; use localhost or HTTPS.
- **Speech recognition unavailable:** use Chrome/Edge or manually type the transcript.
- **Port busy:** change `server.port` in `application.properties` or stop the conflicting process.

## Deployment
Suggested beginner-friendly deployment:
1. **MySQL:** use a managed MySQL provider such as Aiven, Railway, or a cloud-provider managed database. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in backend environment settings.
2. **Backend:** deploy the `backend/` Maven app to Render, Railway, or a Java-capable container host. Set the same database variables and `CORS_ALLOWED_ORIGINS` to your deployed frontend URL. Set the host's port binding as needed; default is 8080.
3. **Frontend:** deploy `frontend/` to Vercel or Netlify. Set `VITE_API_BASE_URL` if using a separately hosted backend (e.g. `https://your-backend.example.com/api`). Configure the host rewrite/proxy as appropriate; the included Vite proxy is for local development only.
4. Use HTTPS for microphone permissions and never put database credentials or provider keys in frontend variables.
5. Deployment has **not** been performed and no live URL is claimed.

## Publish to GitHub
Create an empty repository on GitHub, then from the project root:
```bash
git init
git add .
git commit -m "Build SpeechFlow full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/speechflow.git
git push -u origin main
```
Replace the URL with your actual repository URL. Do not commit `.env` files or real credentials.

## Security and limitations
- This is a demo app with no authentication; records are shared by whoever can access the API.
- Add authentication/authorization before public deployment.
- No external Gemini Live API integration is implemented; the browser Web Speech API is the working provider where supported.
- API pagination is intentionally omitted in favor of a search-filtered manageable list.
- Browser speech recognition accuracy, continuous behavior and language support vary.
