package com.pt28.cabinetmedical.config;

import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorRepository;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import com.pt28.cabinetmedical.patient.AccountStatus;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.settings.CabinetSettings;
import com.pt28.cabinetmedical.settings.CabinetSettingsRepository;
import com.pt28.cabinetmedical.user.Role;
import com.pt28.cabinetmedical.user.User;
import com.pt28.cabinetmedical.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Seeds the default accounts and cabinet settings on startup (idempotent).
 *
 * <p>Seed accounts are created here — instead of in a Flyway SQL script — so their passwords are
 * hashed with the application's BCrypt encoder, guaranteeing the documented credentials work.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final CabinetSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           MedicalRecordRepository medicalRecordRepository,
                           CabinetSettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedSettings();
        seedStaff("Administrateur", "admin@cabinet.ma", "Admin123!", Role.ADMIN);
        User doctorUser = seedStaff("Dr. Doctor", "doctor@cabinet.ma", "Doctor123!", Role.DOCTOR);
        seedStaff("Secretaire", "secretary@cabinet.ma", "Secretary123!", Role.SECRETARY);
        seedDoctorProfile(doctorUser);
        seedPatient();
        log.info("Seed data is ready.");
    }

    private void seedSettings() {
        if (settingsRepository.count() == 0) {
            settingsRepository.save(CabinetSettings.builder()
                    .dailyAppointmentLimit(20)
                    .openingTime(LocalTime.of(9, 0))
                    .closingTime(LocalTime.of(18, 0))
                    .appointmentDuration(30)
                    .build());
        }
    }

    private User seedStaff(String name, String email, String rawPassword, Role role) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    boolean changed = false;
                    if (!name.equals(existing.getName())) {
                        existing.setName(name);
                        changed = true;
                    }
                    if (existing.getRole() != role) {
                        existing.setRole(role);
                        changed = true;
                    }
                    if (!existing.isEnabled()) {
                        existing.setEnabled(true);
                        changed = true;
                    }
                    if (!passwordEncoder.matches(rawPassword, existing.getPassword())) {
                        existing.setPassword(passwordEncoder.encode(rawPassword));
                        changed = true;
                    }
                    if (changed) {
                        log.info("Repairing seeded {} account: {}", role, email);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    log.info("Seeding {} account: {}", role, email);
                    return userRepository.save(User.builder()
                            .name(name)
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .role(role)
                            .enabled(true)
                            .build());
                });
    }

    private void seedDoctorProfile(User doctorUser) {
        if (doctorUser != null && !doctorRepository.existsByUserId(doctorUser.getId())) {
            doctorRepository.save(Doctor.builder()
                    .user(doctorUser)
                    .specialty("Medecine generale")
                    .availability("Mon-Fri 09:00-17:00")
                    .build());
        }
    }

    private void seedPatient() {
        if (patientRepository.existsByCin("AA123456")) {
            return;
        }
        log.info("Seeding patient account: CIN AA123456");
        Patient patient = patientRepository.save(Patient.builder()
                .cin("AA123456")
                .firstName("Ahmed")
                .lastName("Benali")
                .phone("0600000000")
                .email("patient@cabinet.ma")
                .birthDate(LocalDate.of(1990, 1, 1))
                .address("Casablanca, Maroc")
                .gender("MALE")
                .passwordHash(passwordEncoder.encode("Patient123!"))
                .accountStatus(AccountStatus.APPROVED)
                .approvedAt(LocalDateTime.now())
                .build());
        if (!medicalRecordRepository.existsByPatientId(patient.getId())) {
            medicalRecordRepository.save(MedicalRecord.builder().patient(patient).build());
        }
    }
}
