package com.pt28.cabinetmedical.patient;

import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.patient.dto.CreatePatientRequest;
import com.pt28.cabinetmedical.patient.dto.PatientResponse;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.security.PrincipalType;
import com.pt28.cabinetmedical.user.Role;
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
class PatientServiceTest {

    @Autowired
    PatientService patientService;
    @Autowired
    PatientRepository patientRepository;

    @Test
    void patient_cannotAccessAnotherPatientsData() {
        Patient seeded = patientRepository.findByCin("AA123456").orElseThrow();

        // Create a second patient (staff action).
        PatientResponse other = patientService.create(new CreatePatientRequest(
                "ZZ999888", "Other", "Patient", "0612345678", "other@example.com",
                LocalDate.of(1988, 3, 3), "Fes", "MALE", "Secret123!"));

        AuthPrincipal seededPrincipal = new AuthPrincipal(
                seeded.getId(), seeded.getCin(), Role.PATIENT, PrincipalType.PATIENT);

        assertThatThrownBy(() -> patientService.getById(other.id(), seededPrincipal))
                .isInstanceOf(ForbiddenAccessException.class);

        // ...but can read their own record.
        PatientResponse self = patientService.getById(seeded.getId(), seededPrincipal);
        assertThat(self.cin()).isEqualTo("AA123456");
    }

    @Test
    void approve_setsAccountStatusApproved() {
        PatientResponse created = patientService.register(new com.pt28.cabinetmedical.patient.dto.RegisterPatientRequest(
                "PP123456", "Pending", "User", "0600000001", "pending@example.com",
                LocalDate.of(1992, 2, 2), "Tanger", "FEMALE", "Secret123!"));
        assertThat(created.accountStatus()).isEqualTo(AccountStatus.PENDING);

        PatientResponse approved = patientService.approve(created.id());
        assertThat(approved.accountStatus()).isEqualTo(AccountStatus.APPROVED);
        assertThat(approved.approvedAt()).isNotNull();
    }
}
