# PT28 - Gestionnaire de Cabinet Médical (Backend API)

Backend-only REST API for a medical cabinet management system: authentication, patients,
doctors, appointments (normal & urgent), medical records, consultations, documents,
notifications, cabinet settings and role-based dashboards.


## Table of contents
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Run with Docker (recommended)](#run-with-docker-recommended)
- [Run locally with Maven](#run-locally-with-maven)
- [Default accounts](#default-accounts)
- [Swagger / OpenAPI](#swagger--openapi)
- [Database configuration](#database-configuration)
- [Useful endpoints](#useful-endpoints)
- [API role matrix](#api-role-matrix)
- [Business rules](#business-rules)
- [Testing](#testing)
- [Postman](#postman)
- [Conflict resolution & decisions](#conflict-resolution--decisions)
- [Troubleshooting](#troubleshooting)

---

## Technologies
- **Java 17**, **Spring Boot 3.3**
- **Maven**
- **Spring Web** (REST), **Spring Data JPA**, **Bean Validation**
- **Spring Security + JWT** (jjwt) — stateless, role-based
- **PostgreSQL** + **Flyway** migrations
- **springdoc-openapi** (Swagger UI)
- **Lombok**
- **Docker** / **docker-compose**
- **JUnit 5** + Spring Boot Test (+ H2 for tests)

## Architecture
Classic layered architecture, organised **by feature (module)**:

```
Controller  ->  Service (business logic)  ->  Repository (Spring Data JPA)  ->  PostgreSQL
     |                |
   DTOs            Mappers
```

- Controllers are thin: validation + delegation only. **No business logic in controllers.**
- All business rules (slot conflicts, daily limit, opening hours, ownership checks, role checks)
  live in the service layer.
- Requests/responses use **DTOs**; passwords / password hashes are never serialized.
- A single `@RestControllerAdvice` produces a consistent JSON error body.
- Authentication supports **two flows**: staff (email + password) and patient (CIN + password),
  both issuing JWTs carrying `id`, `role` and `type` (STAFF / PATIENT).

## Folder structure
```
src/main/java/com/pt28/cabinetmedical
├── CabinetMedicalApplication.java
├── config            # OpenAPI config, DataInitializer (seed)
├── security          # JWT service, filter, SecurityConfig, AuthPrincipal
├── auth              # login (staff/patient), register, me, refresh
├── user              # staff users (ADMIN/DOCTOR/SECRETARY)
├── patient           # patients + approval workflow
├── doctor            # doctor profiles
├── appointment       # appointments, urgent, slots, status workflow
├── medicalrecord     # digital medical records
├── consultation      # consultations (doctor only)
├── document          # file uploads attached to records
├── notification      # simulated WhatsApp / email + history
├── settings          # cabinet settings (hours, limit, duration)
├── dashboard         # role-specific statistics
└── common            # exceptions, error response, page response
    ├── exception
    ├── dto
    └── response

src/main/resources
├── application.yml          # default (dev) profile
├── application-prod.yml     # disables Swagger
└── db/migration             # Flyway: V1 schema, V2 default settings

src/test/java/...            # auth, appointment, patient, consultation tests
postman/                     # Postman collection
Dockerfile, docker-compose.yml, .env.example
```

Each module contains: `entity`, `repository`, `service`, `controller`, `dto/`, and a `mapper` where useful.

---

## Run with Docker (recommended)
Requirements: Docker + Docker Compose.

```bash
# 1. (optional) copy the env file and adjust secrets
cp .env.example .env

# 2. build & start PostgreSQL + the backend
docker compose up --build
```

- API: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui/index.html>
- The database schema is created automatically by Flyway, and the seed accounts +
  default settings are created on first startup.

Stop and remove everything (including the database volume):
```bash
docker compose down -v
```

## Run locally with Maven
Requirements: JDK 17+, Maven (or the bundled `./mvnw`), a running PostgreSQL.

1. Start a PostgreSQL database matching the defaults (or export the env vars below):
   ```bash
   docker run -d --name cabinet_pg \
     -e POSTGRES_DB=cabinet_medical \
     -e POSTGRES_USER=cabinet_user \
     -e POSTGRES_PASSWORD=cabinet_password \
     -p 5432:5432 postgres:16-alpine
   ```
2. Run the app:
   ```bash
   ./mvnw spring-boot:run
   ```
3. (optional) override the connection via environment variables:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cabinet_medical
   export SPRING_DATASOURCE_USERNAME=cabinet_user
   export SPRING_DATASOURCE_PASSWORD=cabinet_password
   ```

Build the jar: `./mvnw clean package` → `target/cabinet-medical.jar`.

## Default accounts
Created automatically on startup (idempotent).

| Role      | Login                 | Password       | Endpoint                         |
|-----------|-----------------------|----------------|----------------------------------|
| ADMIN     | `admin@cabinet.ma`    | `Admin123!`    | `POST /api/v1/auth/staff/login`  |
| DOCTOR    | `doctor@cabinet.ma`   | `Doctor123!`   | `POST /api/v1/auth/staff/login`  |
| SECRETARY | `secretary@cabinet.ma`| `Secretary123!`| `POST /api/v1/auth/staff/login`  |
| PATIENT   | CIN `AA123456`        | `Patient123!`  | `POST /api/v1/auth/patient/login`|

Default cabinet settings: daily limit **20**, opening **09:00**, closing **18:00**, slot duration **30 min**.

**How to authenticate:** call a login endpoint, copy `accessToken`, and send it as
`Authorization: Bearer <token>` on subsequent requests.

## Swagger / OpenAPI
- UI: <http://localhost:8080/swagger-ui/index.html>
- JSON: <http://localhost:8080/v3/api-docs>
- Use the **Authorize** button (top right) and paste a JWT access token.
- Swagger is **enabled only outside the `prod` profile** (security requirement). The default
  profile is `dev`, so Swagger is available in the Docker setup.

## Database configuration
| Setting   | Value             |
|-----------|-------------------|
| host      | `localhost`       |
| port      | `5432`            |
| database  | `cabinet_medical` |
| username  | `cabinet_user`    |
| password  | `cabinet_password`|

Configurable through environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`) and `.env` for Docker.

---

## Useful endpoints
Base path: `/api/v1`

**Auth** (public): `POST /auth/staff/login`, `POST /auth/patient/login`,
`POST /auth/patient/register`, `POST /auth/refresh-token` · (authenticated) `GET /auth/me`, `POST /auth/logout`

**Users** (ADMIN): `POST|GET /users`, `GET|PUT|DELETE /users/{id}`, `PATCH /users/{id}/status`

**Patients**: `GET|POST /patients`, `GET|PUT|DELETE /patients/{id}`,
`GET /patients/search?keyword=`, `GET /patients/by-cin/{cin}`,
`PATCH /patients/{id}/approve`, `PATCH /patients/{id}/reject`, `GET /patients/pending`

**Doctors**: `GET|POST /doctors`, `GET|PUT|DELETE /doctors/{id}`

**Appointments**: `POST /appointments/request` (patient), `POST /appointments` (staff),
`POST /appointments/urgent` (staff), `GET /appointments`, `GET /appointments/{id}`,
`GET /appointments/my`, `GET /appointments/doctor/{doctorId}`, `GET /appointments/date/{date}`,
`GET /appointments/available-slots?doctorId=&date=`,
`PATCH /appointments/{id}/confirm|cancel|complete`, `PUT /appointments/{id}`

**Medical records**: `GET|POST /medical-records`, `GET /medical-records/{id}`,
`GET /medical-records/patient/{patientId}`, `GET /medical-records/my`

**Consultations**: `POST /consultations`, `GET /consultations/{id}`,
`GET /consultations/record/{recordId}`, `PUT|DELETE /consultations/{id}`

**Documents**: `POST /documents/upload` (multipart), `GET /documents/{id}`,
`GET /documents/record/{recordId}`, `DELETE /documents/{id}`

**Notifications**: `GET /notifications`, `GET /notifications/my`,
`GET /notifications/appointment/{appointmentId}`, `POST /notifications/simulate`

**Settings**: `GET /settings`, `PUT /settings`

**Dashboards**: `GET /dashboard/admin|doctor|secretary|patient`

## API role matrix
| Area / Action                         | ADMIN | DOCTOR | SECRETARY | PATIENT |
|---------------------------------------|:-----:|:------:|:---------:|:-------:|
| Staff login                           |  ✓    |  ✓     |  ✓        |         |
| Patient login / register              |       |        |           |  ✓ (public) |
| Manage users / roles                  |  ✓    |        |           |         |
| Manage cabinet settings               |  ✓    |        |           |         |
| Manage patients (create/update/delete)|  ✓    |        |  ✓        |  own contact only |
| View patients / search by CIN         |  ✓    |  ✓     |  ✓        |         |
| Approve / reject patient accounts     |  ✓    |        |  ✓        |         |
| Request normal appointment            |       |        |           |  ✓      |
| Create normal appointment             |  ✓    |        |  ✓        |         |
| Create **urgent** appointment         |  ✓    |  ✓     |  ✓        |  ✗      |
| Confirm appointment                   |  ✓    |        |  ✓        |         |
| Cancel appointment                    |  ✓    |        |  ✓        |  own only |
| Complete appointment                  |  ✓    |  ✓     |  ✓        |         |
| View medical records                  |  ✓    |  ✓     |  ✓        |  own only |
| Create consultation                   |       |  ✓     |           |         |
| Upload / manage documents             |  ✓    |  ✓     |  ✓        |         |
| View own appointments / notifications |       |        |           |  ✓      |
| Dashboard                             | admin | doctor | secretary | patient |

`✗` = explicitly forbidden by a business rule (returns HTTP 403).

## Business rules
Enforced in the **service layer** (not only controllers):
1. CIN is **required and unique**.
2. A patient can see only **their own** data (profile, appointments, medical record, notifications).
3. A patient cannot access another patient by changing the URL id → **403**.
4. A patient **cannot** create urgent appointments.
5. Urgent appointments can be created only by ADMIN / DOCTOR / SECRETARY.
6. Before creating/validating an appointment the system checks: doctor availability, time-slot
   conflict, cabinet opening/closing hours, daily appointment limit. (Urgent appointments bypass
   the **daily limit** but still respect conflicts & opening hours.)
7. Status flow: patient request → `PENDING`; SECRETARY/ADMIN `CONFIRM`/`CANCEL`;
   DOCTOR/SECRETARY/ADMIN `COMPLETE`.
8. Confirming / cancelling an appointment creates a **Notification** record.
9. WhatsApp/email notifications are **simulated** (no external API keys); each is persisted and
   marked `SENT`.
10. Medical records are accessible to ADMIN/DOCTOR/SECRETARY, and to the owning patient (their own).
11. Consultations can be created only by a **DOCTOR**.
12. PENDING patient accounts can be approved/rejected by ADMIN or SECRETARY; a `MedicalRecord` is
    auto-created at registration.

### Consistent error format
```json
{
  "timestamp": "2026-06-15T10:15:30.123",
  "status": 409,
  "error": "Conflict",
  "message": "The selected time slot is already booked for this doctor",
  "path": "/api/v1/appointments"
}
```
Handled: validation (400, with per-field `errors`), not found (404), unauthorized (401),
forbidden (403), duplicate CIN/email (409), appointment conflict (409), daily limit reached (409),
invalid slot (400), account pending/rejected (403).

## Testing
```bash
./mvnw test
```
Tests run against an in-memory **H2** database (Flyway disabled, schema from JPA entities) and cover:
- staff & patient login, `GET /auth/me`
- patient registration (PENDING + auto medical record) and pending-account login rejection
- appointment slot conflict
- patient cannot access another patient's data
- patient cannot create urgent appointments (403)
- doctor can create a consultation (and non-doctor cannot)

## Postman
Import `postman/PT28_Cabinet_Medical_API.postman_collection.json`.
Variables: `baseUrl`, `adminToken`, `doctorToken`, `secretaryToken`, `patientToken`.
Run the four login requests first — they auto-populate the token variables used by every other request.

---

## Conflict resolution & decisions
Per the brief, when the **UML diagrams** conflicted with the **cahier des charges / project prompt**,
the latter takes priority:

- **Enum values use English** (prompt/cahier des charges) instead of the diagram's French labels:
  - `Role`: `ADMIN, DOCTOR, SECRETARY, PATIENT` (diagram: MEDECIN/SECRETAIRE)
  - `AppointmentStatus`: `PENDING, CONFIRMED, CANCELLED, COMPLETED` (diagram: EN_ATTENTE/CONFIRME/ANNULE/TERMINE)
  - `AccountStatus`: `PENDING, APPROVED, REJECTED` (diagram: EN_ATTENTE/ACTIVE/REFUSE)
  - `NotificationStatus`: `PENDING, SENT, FAILED` (diagram: EN_ATTENTE/ENVOYE/ECHEC)
- **Patients are a separate entity** from `User` (they authenticate by CIN, not email), matching the
  two-space design described in the cahier des charges, even though the diagram links them loosely.
- **Seed accounts are created by a `DataInitializer`** (not raw SQL) so passwords are hashed with the
  application's BCrypt encoder — guaranteeing the documented credentials work. Flyway still owns the
  schema and seeds the default `cabinet_settings` row.
- **Flyway owns the schema** in the Postgres profiles (`spring.jpa.hibernate.ddl-auto=none`); the test
  profile generates the schema from entities on H2.
- **Urgent appointments bypass the daily limit** (they are exceptions by nature) but still respect
  slot conflicts and opening hours.
- **SMS** is mentioned in some source docs but the prompt's `NotificationChannel` is `EMAIL` /
  `WHATSAPP` only — so only those two channels are implemented.

## Troubleshooting
- **Port 8080 already in use** → change `APP_PORT` in `.env` (Docker) or `server.port` / `SERVER_PORT`.
- **Port 5432 already in use** → change `POSTGRES_PORT` in `.env`, or stop the local PostgreSQL.
- **`docker compose up` fails to connect to DB** → the app waits for the DB healthcheck; if it still
  fails, run `docker compose down -v` and retry (clears a corrupted volume).
- **401 on every call** → missing/expired token. Re-login and send `Authorization: Bearer <token>`.
- **403 Forbidden** → the role is not allowed for that endpoint (see the role matrix), or a patient
  is trying to access another patient's data.
- **Patient login returns 403** → the account is still `PENDING`; approve it via
  `PATCH /api/v1/patients/{id}/approve` (ADMIN/SECRETARY) or use the seeded `AA123456` account.
- **Swagger returns 404** → you are running the `prod` profile (Swagger is disabled there); use the
  default/`dev` profile.
- **`mvn test` cannot download dependencies** → ensure internet access to Maven Central on first run.
