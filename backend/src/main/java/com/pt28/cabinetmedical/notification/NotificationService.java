package com.pt28.cabinetmedical.notification;

import com.pt28.cabinetmedical.appointment.Appointment;
import com.pt28.cabinetmedical.appointment.AppointmentRepository;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.notification.dto.NotificationResponse;
import com.pt28.cabinetmedical.notification.dto.SimulateNotificationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Records and "sends" notifications. Real WhatsApp/email delivery is simulated: a notification is
 * persisted and immediately marked SENT (business rule 9 — no external API keys required).
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final AppointmentRepository appointmentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               AppointmentRepository appointmentRepository) {
        this.notificationRepository = notificationRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /** Creates and "sends" a notification tied to an appointment (used on confirm / cancel / create). */
    @Transactional
    public Notification createForAppointment(Appointment appointment, NotificationChannel channel, String message) {
        String recipient = appointment.getPatient() != null ? appointment.getPatient().getEmail() : null;
        Notification notification = Notification.builder()
                .appointment(appointment)
                .channel(channel)
                .recipient(recipient)
                .message(message)
                .status(NotificationStatus.PENDING)
                .build();
        return simulateSend(notification);
    }

    @Transactional
    public NotificationResponse simulate(SimulateNotificationRequest request) {
        Appointment appointment = null;
        if (request.appointmentId() != null) {
            appointment = appointmentRepository.findById(request.appointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment", request.appointmentId()));
        }
        Notification notification = Notification.builder()
                .appointment(appointment)
                .channel(request.channel())
                .recipient(request.recipient())
                .message(request.message())
                .status(NotificationStatus.PENDING)
                .build();
        return NotificationMapper.toResponse(simulateSend(notification));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAll(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(NotificationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForPatient(Long patientId, Pageable pageable) {
        return notificationRepository.findByAppointmentPatientId(patientId, pageable).map(NotificationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getByAppointment(Long appointmentId) {
        return notificationRepository.findByAppointmentIdOrderBySentAtDesc(appointmentId).stream()
                .map(NotificationMapper::toResponse)
                .toList();
    }

    private Notification simulateSend(Notification notification) {
        // Simulated delivery: in a real system this would call the WhatsApp/email gateway.
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        log.info("[SIMULATED {}] to '{}': {}", notification.getChannel(), notification.getRecipient(), notification.getMessage());
        return notificationRepository.save(notification);
    }
}
