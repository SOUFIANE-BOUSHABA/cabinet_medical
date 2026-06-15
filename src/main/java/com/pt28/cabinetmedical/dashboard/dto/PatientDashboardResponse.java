package com.pt28.cabinetmedical.dashboard.dto;

import com.pt28.cabinetmedical.appointment.dto.AppointmentResponse;

import java.util.List;

public record PatientDashboardResponse(
        long pendingRequests,
        long confirmedAppointments,
        long notifications,
        List<AppointmentResponse> upcomingAppointments
) {
}
