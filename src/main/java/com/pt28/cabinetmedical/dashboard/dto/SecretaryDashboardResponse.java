package com.pt28.cabinetmedical.dashboard.dto;

public record SecretaryDashboardResponse(
        long pendingAppointmentRequests,
        long totalPatients,
        long pendingPatientAccounts,
        long todayAppointments,
        long confirmedToday,
        long cancelledToday
) {
}
