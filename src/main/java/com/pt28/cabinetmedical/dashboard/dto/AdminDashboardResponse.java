package com.pt28.cabinetmedical.dashboard.dto;

public record AdminDashboardResponse(
        long totalPatients,
        long totalUsers,
        long totalDoctors,
        long todayAppointments,
        long pendingAppointments,
        long confirmedAppointments,
        long cancelledAppointments,
        long pendingPatientAccounts
) {
}
