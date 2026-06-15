package com.pt28.cabinetmedical.dashboard.dto;

import com.pt28.cabinetmedical.appointment.dto.AppointmentResponse;

import java.util.List;

public record DoctorDashboardResponse(
        long todayAppointmentsCount,
        long urgentAppointmentsToday,
        long totalConsultations,
        List<AppointmentResponse> todayAppointments
) {
}
