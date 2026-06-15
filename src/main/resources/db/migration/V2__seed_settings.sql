-- =====================================================================
-- V2 : Default cabinet settings.
--
-- Seed accounts (admin / doctor / secretary / patient) are inserted by
-- the application DataInitializer instead of plain SQL, so that their
-- passwords are correctly hashed with BCrypt at startup (see README,
-- "Conflict resolution & decisions").
-- =====================================================================

INSERT INTO cabinet_settings (id, daily_appointment_limit, opening_time, closing_time, appointment_duration)
VALUES (1, 20, '09:00', '18:00', 30);
