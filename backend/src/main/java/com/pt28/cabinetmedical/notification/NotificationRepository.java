package com.pt28.cabinetmedical.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByAppointmentIdOrderBySentAtDesc(Long appointmentId);

    Page<Notification> findByAppointmentPatientId(Long patientId, Pageable pageable);

    Page<Notification> findByAppointmentDoctorUserId(Long doctorUserId, Pageable pageable);

    long countByAppointmentPatientId(Long patientId);
}
