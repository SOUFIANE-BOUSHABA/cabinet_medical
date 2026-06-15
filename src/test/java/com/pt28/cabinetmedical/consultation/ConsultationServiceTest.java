package com.pt28.cabinetmedical.consultation;

import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.consultation.dto.ConsultationResponse;
import com.pt28.cabinetmedical.consultation.dto.CreateConsultationRequest;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.security.PrincipalType;
import com.pt28.cabinetmedical.user.Role;
import com.pt28.cabinetmedical.user.User;
import com.pt28.cabinetmedical.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ConsultationServiceTest {

    @Autowired
    ConsultationService consultationService;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    MedicalRecordRepository medicalRecordRepository;
    @Autowired
    UserRepository userRepository;

    private Long medicalRecordId;
    private AuthPrincipal doctorPrincipal;

    @BeforeEach
    void setUp() {
        Patient patient = patientRepository.findByCin("AA123456").orElseThrow();
        MedicalRecord record = medicalRecordRepository.findByPatientId(patient.getId()).orElseThrow();
        medicalRecordId = record.getId();
        User doctorUser = userRepository.findByEmail("doctor@cabinet.ma").orElseThrow();
        doctorPrincipal = new AuthPrincipal(doctorUser.getId(), doctorUser.getEmail(), Role.DOCTOR, PrincipalType.STAFF);
    }

    @Test
    void doctor_canCreateConsultation() {
        CreateConsultationRequest request = new CreateConsultationRequest(
                medicalRecordId, LocalDate.now(), "Flu", "Rest required", "Paracetamol");

        ConsultationResponse response = consultationService.create(request, doctorPrincipal);

        assertThat(response.id()).isNotNull();
        assertThat(response.diagnosis()).isEqualTo("Flu");
        assertThat(response.medicalRecordId()).isEqualTo(medicalRecordId);
    }

    @Test
    void secretary_cannotCreateConsultation() {
        AuthPrincipal secretaryPrincipal = new AuthPrincipal(99L, "secretary@cabinet.ma", Role.SECRETARY, PrincipalType.STAFF);
        CreateConsultationRequest request = new CreateConsultationRequest(
                medicalRecordId, LocalDate.now(), "Flu", "notes", "treatment");

        assertThatThrownBy(() -> consultationService.create(request, secretaryPrincipal))
                .isInstanceOf(ForbiddenAccessException.class);
    }
}
