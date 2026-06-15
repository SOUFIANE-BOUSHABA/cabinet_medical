package com.pt28.cabinetmedical.doctor;

import com.pt28.cabinetmedical.doctor.dto.DoctorResponse;

public final class DoctorMapper {

    private DoctorMapper() {
    }

    public static DoctorResponse toResponse(Doctor doctor) {
        var user = doctor.getUser();
        return new DoctorResponse(
                doctor.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getName() : null,
                user != null ? user.getEmail() : null,
                doctor.getSpecialty(),
                doctor.getAvailability()
        );
    }
}
