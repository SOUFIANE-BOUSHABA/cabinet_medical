package com.pt28.cabinetmedical.appointment;

import com.pt28.cabinetmedical.appointment.dto.AppointmentResponse;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.patient.Patient;

public final class AppointmentMapper {

    private AppointmentMapper() {
    }

    public static AppointmentResponse toResponse(Appointment a) {
        Patient patient = a.getPatient();
        Doctor doctor = a.getDoctor();
        String patientName = patient != null ? patient.getFirstName() + " " + patient.getLastName() : null;
        String doctorName = (doctor != null && doctor.getUser() != null) ? doctor.getUser().getName() : null;
        return new AppointmentResponse(
                a.getId(),
                patient != null ? patient.getId() : null,
                patientName,
                doctor != null ? doctor.getId() : null,
                doctorName,
                a.getDate(),
                a.getStartTime(),
                a.getEndTime(),
                a.getReason(),
                a.getStatus(),
                a.getType(),
                a.isUrgent(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
