package com.pt28.cabinetmedical.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdAndDateAndStatusNot(Long doctorId, LocalDate date, AppointmentStatus excludedStatus);

    long countByDateAndStatusNot(LocalDate date, AppointmentStatus excludedStatus);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByDate(LocalDate date, Pageable pageable);

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByStatusAndDate(AppointmentStatus status, LocalDate date, Pageable pageable);

    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);

    List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    long countByStatus(AppointmentStatus status);

    long countByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, AppointmentStatus status);
}
