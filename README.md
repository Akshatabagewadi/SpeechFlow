# SpeechFlow — Real-Time Multilingual Speech-to-Text

SpeechFlow is a web-based speech-to-text application that converts spoken language into text using the browser's speech recognition capabilities. Users can create, save, search, view, edit, and delete transcription records.

## Features

- **Real-Time Speech Recognition:** Convert speech into text using your microphone.
- **Multilingual Support:** Recognize speech in supported languages.
- **Transcription Management:** Create, view, edit, and delete saved transcriptions.
- **Search:** Find saved transcriptions using keywords.
- **Persistent Storage:** Store transcription records in a MySQL database.
- **Responsive Interface:** Use the application through a modern web interface.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Java 17, Spring Boot, Spring Data JPA |
| Database | MySQL 8 |
| Speech Recognition | Browser Web Speech API |
| Build Tool | Maven |
| Version Control | Git and GitHub |

## Project Structure

```text
SpeechFlow/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/speechflow/
│   │   │   └── resources/
│   │   └── test/
│   ├── .env.example
│   ├── pom.xml
│   └── README.md
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running SpeechFlow:

- Java Development Kit (JDK) 17 or later
- Apache Maven 3.9 or compatible version
- Node.js and npm
- MySQL Server 8
- A modern browser with Web Speech API support, such as Google Chrome

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Akshatabagewadi/SpeechFlow.git
cd SpeechFlow
```

### 2. Configure the MySQL database

Start MySQL Server and create the database:

```sql
CREATE DATABASE speechflow;
```

Create a dedicated MySQL user and grant access to the database. Replace the example password with your own secure password.

```sql
CREATE USER 'speechflow_user'@'localhost'
IDENTIFIED BY 'YOUR_SECURE_PASSWORD';

GRANT ALL PRIVILEGES ON speechflow.*
TO 'speechflow_user'@'localhost';

FLUSH PRIVILEGES;
```

The application uses Hibernate to update the database schema automatically when configured with `spring.jpa.hibernate.ddl-auto=update`.

### 3. Configure the backend

Open a terminal in the backend directory:

```bash
cd backend
```

Configure the database connection using environment variables:

**PowerShell (Windows):**

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/speechflow?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="speechflow_user"
$env:DB_PASSWORD="YOUR_SECURE_PASSWORD"
```

Start the Spring Boot application on port `8081` if port `8080` is already in use:

```powershell
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

The backend should be available at:

`http://localhost:8081`

Keep this terminal open while using the application.

### 4. Configure and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

If needed, create a `.env.local` file inside `frontend` with:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in the terminal, normally:

`http://localhost:5173`

## How to Use

1. Open SpeechFlow in a supported browser.
2. Allow microphone access when prompted.
3. Select a supported recognition language, if the interface provides language selection.
4. Start recording and speak clearly.
5. Review the recognized text.
6. Save the transcription.
7. Open the history section to view saved records.
8. Search for records or use the available view, edit, and delete actions.

Microphone access and speech recognition depend on browser support and permissions. Some browser speech-recognition services may require an internet connection.

## API Overview

The frontend communicates with the Spring Boot backend through REST endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transcriptions` | Retrieve transcription records |
| GET | `/api/transcriptions/{id}` | Retrieve a specific record |
| POST | `/api/transcriptions` | Create a transcription |
| PUT | `/api/transcriptions/{id}` | Update a transcription |
| DELETE | `/api/transcriptions/{id}` | Delete a transcription |

The list endpoint supports a search query when configured, for example:

`GET /api/transcriptions?search=meeting`

## Testing

Backend tests can be run from the `backend` directory:

```bash
mvn test
```

To test the application manually, verify that you can:

- Open the frontend.
- Grant microphone permission and recognize speech.
- Save a transcription.
- View saved records.
- Search for a transcription.
- Edit and delete records.
- Restart the application and confirm saved records remain in the database.

## Security Notes

- Never commit actual database passwords, API keys, or other secrets.
- Use `.env.example` files to document configuration variables without exposing credentials.
- Keep local `.env` and `.env.local` files out of version control.
- Use a dedicated database account rather than the MySQL root account.

## Limitations

- Speech recognition availability and language support depend on the browser and its speech-recognition implementation.
- Microphone permissions are required for recording.
- The application must be configured with a running backend and MySQL database to persist transcription records.

## Author

**Akshata Bagewadi**

GitHub: [Akshatabagewadi](https://github.com/Akshatabagewadi)

Project Repository: [SpeechFlow](https://github.com/Akshatabagewadi/SpeechFlow)
