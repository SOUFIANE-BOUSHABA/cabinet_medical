package com.pt28.cabinetmedical.appointment;

import com.pt28.cabinetmedical.appointment.dto.CreateAppointmentRequest;
import com.pt28.cabinetmedical.common.exception.AppointmentConflictException;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorRepository;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.user.User;
import com.pt28.cabinetmedical.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AppointmentServiceTest {

    @Autowired
    AppointmentService appointmentService;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    UserRepository userRepository;

    private Long patientId;
    private Long doctorId;

    @BeforeEach
    void setUp() {
        Patient patient = patientRepository.findByCin("AA123456").orElseThrow();
        patientId = patient.getId();
        User doctorUser = userRepository.findByEmail("doctor@cabinet.ma").orElseThrow();
        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId()).orElseThrow();
        doctorId = doctor.getId();
    }

    @Test
    void createByStaff_overlappingSlot_throwsConflict() {
        LocalDate date = LocalDate.now().plusDays(3);
        CreateAppointmentRequest first = new CreateAppointmentRequest(
                patientId, doctorId, date, LocalTime.of(10, 0), "Checkup", null);
        appointmentService.createByStaff(first);

        CreateAppointmentRequest overlapping = new CreateAppointmentRequest(
                patientId, doctorId, date, LocalTime.of(10, 15), "Overlap", null);

        assertThatThrownBy(() -> appointmentService.createByStaff(overlapping))
                .isInstanceOf(AppointmentConflictException.class);
    }

    @Test
    void createByStaff_freeSlot_succeeds() {
        LocalDate date = LocalDate.now().plusDays(4);
        CreateAppointmentRequest request = new CreateAppointmentRequest(
                patientId, doctorId, date, LocalTime.of(9, 0), "Consultation", null);

        var response = appointmentService.createByStaff(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.endTime()).isEqualTo(LocalTime.of(9, 30));
        assertThat(response.status().name()).isEqualTo("CONFIRMED");
    }
}
