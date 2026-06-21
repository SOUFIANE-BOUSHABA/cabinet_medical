# Cabinet Medical - Setup and Run Guide

This repository contains two applications:

```text
cabinet-medical/
|-- backend/    # Spring Boot REST API + PostgreSQL
`-- frontend/   # React + TypeScript + Tailwind CSS
```

## 1. Requirements

Install these tools before starting:

- Docker Desktop (recommended for the backend and PostgreSQL)
- Node.js 20 or newer
- npm
- Git (optional)

If you want to run the backend without Docker, install JDK 17 or newer.

## 2. Start the backend

Open PowerShell in the project root:

```powershell
cd C:\Users\ycode\Desktop\cabinet-medical\backend
docker compose up --build -d
```

Check that the containers are running:

```powershell
docker compose ps
```

Backend addresses:

- API: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui/index.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>

To follow the backend logs:

```powershell
docker compose logs -f app
```

To stop the backend and database without deleting their data:

```powershell
docker compose down
```

### Database connection

Use these values in DBeaver:

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `cabinet_medical` |
| Username | `cabinet_user` |
| Password | `cabinet_password` |

JDBC URL:

```text
jdbc:postgresql://localhost:5432/cabinet_medical
```

## 3. Start the frontend

Keep the backend running. Open a second PowerShell terminal:

```powershell
cd C:\Users\ycode\Desktop\cabinet-medical\frontend
npm install
npm run api:types
npm run dev
```

Vite displays the local URL in the terminal. By default, open:

<http://localhost:5173>

The frontend sends `/api/v1` requests through the Vite proxy to the backend at
`http://localhost:8080`.

## 4. First paths to open

| Screen | URL |
|---|---|
| Default entry / patient login | <http://localhost:5173/> |
| Patient login | <http://localhost:5173/patient/login> |
| Patient registration | <http://localhost:5173/patient/register> |
| Staff login | <http://localhost:5173/staff/login> |

After a successful login, the application redirects the account to its
role-specific dashboard.

## 5. Seeded accounts

The backend creates these accounts automatically when it starts:

| Role | Login | Password | Login page |
|---|---|---|---|
| Admin | `admin@cabinet.ma` | `Admin123!` | Staff login |
| Doctor | `doctor@cabinet.ma` | `Doctor123!` | Staff login |
| Secretary | `secretary@cabinet.ma` | `Secretary123!` | Staff login |
| Patient | CIN `AA123456` | `Patient123!` | Patient login |

Staff accounts log in with an email and password. The patient logs in with a
CIN and password.

## 6. Use authentication in Swagger

1. Open <http://localhost:8080/swagger-ui/index.html>.
2. Run `POST /api/v1/auth/staff/login` or
   `POST /api/v1/auth/patient/login`.
3. Copy `accessToken` from the response.
4. Click **Authorize** in Swagger.
5. Paste the token and confirm.
6. You can now test protected endpoints.

Staff login example:

```json
{
  "email": "admin@cabinet.ma",
  "password": "Admin123!"
}
```

Patient login example:

```json
{
  "cin": "AA123456",
  "password": "Patient123!"
}
```

## 7. Frontend quality commands

Run these commands from `frontend/`:

```powershell
npm run test
npm run lint
npm run build
npm run check
```

`npm run check` regenerates the OpenAPI types, checks formatting, runs ESLint,
runs the tests, and creates a production build.

## 8. Run the backend without Docker (optional)

First ensure PostgreSQL is running with the database configuration shown
above. Then run:

```powershell
cd C:\Users\ycode\Desktop\cabinet-medical\backend
.\mvnw.cmd spring-boot:run
```

Do not run the Docker backend and the local Maven backend at the same time,
because both use port `8080`.

## 9. Common problems

### PostgreSQL password authentication failed

Verify that DBeaver uses database `cabinet_medical`, username `cabinet_user`,
and password `cabinet_password`. Do not use `postgres` as the username for this
project.

### Port 5432 or 8080 is already in use

Check whether the project is already running:

```powershell
docker ps
```

Stop the duplicate service before starting another copy.

### Frontend cannot reach the backend

Confirm that <http://localhost:8080/swagger-ui/index.html> opens, then restart
the frontend with `npm run dev`.

### Backend endpoints changed

Regenerate the frontend API types:

```powershell
cd C:\Users\ycode\Desktop\cabinet-medical\frontend
npm run api:types
```
