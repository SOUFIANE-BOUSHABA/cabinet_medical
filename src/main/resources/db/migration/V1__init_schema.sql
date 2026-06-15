-- =====================================================================
-- PT28 - Gestionnaire de Cabinet Medical
-- V1 : Initial schema (tables, constraints, indexes)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Staff users (ADMIN, DOCTOR, SECRETARY)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)        NOT NULL,
    email       VARCHAR(180)        NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(30)         NOT NULL,
    enabled     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- ---------------------------------------------------------------------
-- Doctor profile (1..1 optional link to a user)
-- ---------------------------------------------------------------------
CREATE TABLE doctors (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT              NOT NULL,
    specialty     VARCHAR(150),
    availability  VARCHAR(255),
    CONSTRAINT uk_doctors_user UNIQUE (user_id),
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Patients (external users, authenticate with CIN + password)
-- ---------------------------------------------------------------------
CREATE TABLE patients (
    id              BIGSERIAL PRIMARY KEY,
    cin             VARCHAR(30)         NOT NULL,
    first_name      VARCHAR(100)        NOT NULL,
    last_name       VARCHAR(100)        NOT NULL,
    phone           VARCHAR(30),
    email           VARCHAR(180),
    birth_date      DATE,
    address         VARCHAR(255),
    gender          VARCHAR(20),
    password_hash   VARCHAR(255)        NOT NULL,
    account_status  VARCHAR(30)         NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at     TIMESTAMP,
    CONSTRAINT uk_patients_cin UNIQUE (cin)
);

CREATE INDEX idx_patients_cin ON patients (cin);
CREATE INDEX idx_patients_status ON patients (account_status);

-- ---------------------------------------------------------------------
-- Medical records (1..1 with patient)
-- ---------------------------------------------------------------------
CREATE TABLE medical_records (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT              NOT NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_medical_records_patient UNIQUE (patient_id),
    CONSTRAINT fk_medical_records_patient FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------
CREATE TABLE appointments (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT              NOT NULL,
    doctor_id   BIGINT              NOT NULL,
    date        DATE                NOT NULL,
    start_time  TIME                NOT NULL,
    end_time    TIME                NOT NULL,
    reason      VARCHAR(500),
    status      VARCHAR(30)         NOT NULL DEFAULT 'PENDING',
    type        VARCHAR(30)         NOT NULL DEFAULT 'NORMAL',
    is_urgent   BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
);

CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_id, date);
CREATE INDEX idx_appointments_date ON appointments (date);
CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_status ON appointments (status);

-- ---------------------------------------------------------------------
-- Consultations
-- ---------------------------------------------------------------------
CREATE TABLE consultations (
    id                  BIGSERIAL PRIMARY KEY,
    medical_record_id   BIGINT              NOT NULL,
    doctor_id           BIGINT              NOT NULL,
    consultation_date   DATE                NOT NULL,
    diagnosis           VARCHAR(1000),
    notes               VARCHAR(2000),
    treatment           VARCHAR(2000),
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consultations_record FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE CASCADE,
    CONSTRAINT fk_consultations_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id)
);

CREATE INDEX idx_consultations_record ON consultations (medical_record_id);

-- ---------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------
CREATE TABLE documents (
    id                  BIGSERIAL PRIMARY KEY,
    medical_record_id   BIGINT              NOT NULL,
    file_name           VARCHAR(255)        NOT NULL,
    file_path           VARCHAR(500)        NOT NULL,
    file_type           VARCHAR(100),
    uploaded_at         TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_record FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_record ON documents (medical_record_id);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT,
    channel         VARCHAR(30)         NOT NULL,
    recipient       VARCHAR(180),
    message         VARCHAR(1000),
    status          VARCHAR(30)         NOT NULL DEFAULT 'PENDING',
    sent_at         TIMESTAMP,
    CONSTRAINT fk_notifications_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_appointment ON notifications (appointment_id);

-- ---------------------------------------------------------------------
-- Cabinet settings (single row)
-- ---------------------------------------------------------------------
CREATE TABLE cabinet_settings (
    id                          BIGSERIAL PRIMARY KEY,
    daily_appointment_limit     INTEGER             NOT NULL DEFAULT 20,
    opening_time                TIME                NOT NULL DEFAULT '09:00',
    closing_time                TIME                NOT NULL DEFAULT '18:00',
    appointment_duration        INTEGER             NOT NULL DEFAULT 30
);
