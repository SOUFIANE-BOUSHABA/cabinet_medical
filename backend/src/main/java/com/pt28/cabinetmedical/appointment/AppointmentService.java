package com.pt28.cabinetmedical.appointment;

import com.pt28.cabinetmedical.appointment.dto.*;
import com.pt28.cabinetmedical.common.exception.AppointmentConflictException;
import com.pt28.cabinetmedical.common.exception.BusinessRuleException;
import com.pt28.cabinetmedical.common.exception.DailyLimitReachedException;
import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.common.exception.InvalidSlotException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorService;
import com.pt28.cabinetmedical.notification.NotificationChannel;
import com.pt28.cabinetmedical.notification.NotificationService;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientService;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.settings.CabinetSettings;
import com.pt28.cabinetmedical.settings.CabinetSettingsService;
import com.pt28.cabinetmedical.user.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final CabinetSettingsService settingsService;
    private final NotificationService notificationService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientService patientService,
                              DoctorService doctorService,
                              CabinetSettingsService settingsService,
                              NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.settingsService = settingsService;
        this.notificationService = notificationService;
    }

    // ------------------------------------------------------------------ creation

    /** Patient requests a NORMAL appointment for themselves -> status PENDING (rules 4, 7). */
    @Transactional
    public AppointmentResponse requestByPatient(PatientAppointmentRequest request, AuthPrincipal principal) {
        Patient patient = patientService.findEntity(principal.id());
        Doctor doctor = doctorService.findEntity(request.doctorId());
        CabinetSettings settings = settingsService.getSettingsEntity();

        LocalTime endTime = validateSlot(doctor, request.date(), request.startTime(), settings, null, true);

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(endTime)
                .reason(request.reason())
                .status(AppointmentStatus.PENDING)
                .type(AppointmentType.NORMAL)
                .isUrgent(false)
                .build());

        notificationService.createForAppointment(appointment, NotificationChannel.EMAIL,
                buildMessage(appointment, "Your appointment request has been received and is pending validation"));
        return AppointmentMapper.toResponse(appointment);
    }

    /** Staff creates a NORMAL appointment (defaults to CONFIRMED). */
    @Transactional
    public AppointmentResponse createByStaff(CreateAppointmentRequest request) {
        Patient patient = patientService.findEntity(request.patientId());
        Doctor doctor = doctorService.findEntity(request.doctorId());
        CabinetSettings settings = settingsService.getSettingsEntity();

        AppointmentStatus status = request.status() != null ? request.status() : AppointmentStatus.CONFIRMED;
        LocalTime endTime = validateSlot(doctor, request.date(), request.startTime(), settings, null, true);

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(endTime)
                .reason(request.reason())
                .status(status)
                .type(AppointmentType.NORMAL)
                .isUrgent(false)
                .build());

        if (status == AppointmentStatus.CONFIRMED) {
            notificationService.createForAppointment(appointment, NotificationChannel.EMAIL,
                    buildMessage(appointment, "Your appointment has been confirmed"));
        }
        return AppointmentMapper.toResponse(appointment);
    }

    /** Staff creates an URGENT appointment (rules 5, 6 — bypasses the daily limit). */
    @Transactional
    public AppointmentResponse createUrgent(UrgentAppointmentRequest request) {
        Patient patient = patientService.findEntity(request.patientId());
        Doctor doctor = doctorService.findEntity(request.doctorId());
        CabinetSettings settings = settingsService.getSettingsEntity();

        LocalTime endTime = validateSlot(doctor, request.date(), request.startTime(), settings, null, false);

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(endTime)
                .reason(request.reason())
                .status(AppointmentStatus.CONFIRMED)
                .type(AppointmentType.URGENT)
                .isUrgent(true)
                .build());

        notificationService.createForAppointment(appointment, NotificationChannel.WHATSAPP,
                buildMessage(appointment, "An URGENT appointment has been scheduled for you"));
        return AppointmentMapper.toResponse(appointment);
    }

    // ------------------------------------------------------------------ queries

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAll(AppointmentStatus status, LocalDate date, Pageable pageable) {
        return appointmentRepository.search(status, date, pageable).map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id, AuthPrincipal principal) {
        Appointment appointment = findEntity(id);
        if (principal.isPatient() && !principal.id().equals(appointment.getPatient().getId())) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's appointment");
        }
        return AppointmentMapper.toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getMine(AuthPrincipal principal, Pageable pageable) {
        return appointmentRepository.findByPatientId(principal.id(), pageable).map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable).map(AppointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getByDate(LocalDate date, Pageable pageable) {
        return appointmentRepository.findByDate(date, pageable).map(AppointmentMapper::toResponse);
    }

    /** Free slots for a doctor on a date, respecting opening hours, existing bookings and daily limit. */
    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorService.findEntity(doctorId);
        CabinetSettings settings = settingsService.getSettingsEntity();
        List<AvailableSlotResponse> slots = new ArrayList<>();

        if (isDailyLimitReached(date, settings)) {
            return slots; // no slot available — daily limit reached (rule 6)
        }

        List<Appointment> booked = appointmentRepository
                .findByDoctorIdAndDateAndStatusNot(doctor.getId(), date, AppointmentStatus.CANCELLED);
        int duration = settings.getAppointmentDuration();

        LocalTime cursor = settings.getOpeningTime();
        while (!cursor.plusMinutes(duration).isAfter(settings.getClosingTime())) {
            LocalTime end = cursor.plusMinutes(duration);
            LocalTime slotStart = cursor;
            boolean overlaps = booked.stream().anyMatch(a -> a.getStartTime().isBefore(end) && slotStart.isBefore(a.getEndTime()));
            if (!overlaps && isDoctorAvailable(doctor)) {
                slots.add(new AvailableSlotResponse(slotStart, end));
            }
            cursor = end;
        }
        return slots;
    }

    // ------------------------------------------------------------------ status transitions

    @Transactional
    public AppointmentResponse confirm(Long id) {
        Appointment appointment = findEntity(id);
        ensureNotFinal(appointment);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        notificationService.createForAppointment(appointment, NotificationChannel.EMAIL,
                buildMessage(appointment, "Your appointment has been confirmed"));
        return AppointmentMapper.toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancel(Long id, AuthPrincipal principal) {
        Appointment appointment = findEntity(id);
        if (principal.isPatient() && !principal.id().equals(appointment.getPatient().getId())) {
            throw new ForbiddenAccessException("You are not allowed to cancel another patient's appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessRuleException("A completed appointment cannot be cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        notificationService.createForAppointment(appointment, NotificationChannel.EMAIL,
                buildMessage(appointment, "Your appointment has been cancelled"));
        return AppointmentMapper.toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse complete(Long id) {
        Appointment appointment = findEntity(id);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessRuleException("A cancelled appointment cannot be completed");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse update(Long id, UpdateAppointmentRequest request) {
        Appointment appointment = findEntity(id);
        ensureNotFinal(appointment);
        Doctor doctor = doctorService.findEntity(request.doctorId());
        CabinetSettings settings = settingsService.getSettingsEntity();

        boolean enforceLimit = appointment.getType() == AppointmentType.NORMAL;
        LocalTime endTime = validateSlot(doctor, request.date(), request.startTime(), settings, appointment.getId(), enforceLimit);

        appointment.setDoctor(doctor);
        appointment.setDate(request.date());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(endTime);
        appointment.setReason(request.reason());
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    // ------------------------------------------------------------------ helpers

    public Appointment findEntity(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
    }

    /**
     * Validates opening hours, doctor availability, slot conflicts and (optionally) the daily limit.
     *
     * @return the computed end time
     */
    private LocalTime validateSlot(Doctor doctor, LocalDate date, LocalTime startTime,
                                   CabinetSettings settings, Long excludeAppointmentId, boolean enforceDailyLimit) {
        LocalTime endTime = startTime.plusMinutes(settings.getAppointmentDuration());

        // Cabinet opening / closing hours
        if (startTime.isBefore(settings.getOpeningTime()) || endTime.isAfter(settings.getClosingTime())) {
            throw new InvalidSlotException("Requested slot is outside the cabinet opening hours ("
                    + settings.getOpeningTime() + " - " + settings.getClosingTime() + ")");
        }

        // Doctor availability
        if (!isDoctorAvailable(doctor)) {
            throw new InvalidSlotException("The selected doctor is not available");
        }

        // Slot conflict
        boolean conflict = appointmentRepository
                .findByDoctorIdAndDateAndStatusNot(doctor.getId(), date, AppointmentStatus.CANCELLED).stream()
                .filter(a -> excludeAppointmentId == null || !a.getId().equals(excludeAppointmentId))
                .anyMatch(a -> a.getStartTime().isBefore(endTime) && startTime.isBefore(a.getEndTime()));
        if (conflict) {
            throw new AppointmentConflictException("The selected time slot is already booked for this doctor");
        }

        // Daily limit
        if (enforceDailyLimit && isDailyLimitReached(date, settings)) {
            throw new DailyLimitReachedException("The daily appointment limit ("
                    + settings.getDailyAppointmentLimit() + ") has been reached for " + date);
        }
        return endTime;
    }

    private boolean isDailyLimitReached(LocalDate date, CabinetSettings settings) {
        long count = appointmentRepository.countByDateAndStatusNot(date, AppointmentStatus.CANCELLED);
        return count >= settings.getDailyAppointmentLimit();
    }

    /** Free-text availability: a doctor is considered unavailable only if it explicitly says so. */
    private boolean isDoctorAvailable(Doctor doctor) {
        String availability = doctor.getAvailability();
        if (availability == null || availability.isBlank()) {
            return true;
        }
        String value = availability.toLowerCase();
        return !(value.contains("unavailable") || value.contains("indisponible") || value.equals("off"));
    }

    private void ensureNotFinal(Appointment appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessRuleException("Appointment is already " + appointment.getStatus()
                    + " and can no longer be modified");
        }
    }

    private String buildMessage(Appointment appointment, String prefix) {
        return prefix + " — " + appointment.getDate() + " at " + appointment.getStartTime() + ".";
    }
}
