package com.pt28.cabinetmedical.dashboard;

import com.pt28.cabinetmedical.appointment.Appointment;
import com.pt28.cabinetmedical.appointment.AppointmentMapper;
import com.pt28.cabinetmedical.appointment.AppointmentRepository;
import com.pt28.cabinetmedical.appointment.AppointmentStatus;
import com.pt28.cabinetmedical.consultation.ConsultationRepository;
import com.pt28.cabinetmedical.dashboard.dto.AdminDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.DoctorDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.PatientDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.SecretaryDashboardResponse;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorRepository;
import com.pt28.cabinetmedical.doctor.DoctorService;
import com.pt28.cabinetmedical.notification.NotificationRepository;
import com.pt28.cabinetmedical.patient.AccountStatus;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;
    private final ConsultationRepository consultationRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(PatientRepository patientRepository,
                            AppointmentRepository appointmentRepository,
                            UserRepository userRepository,
                            DoctorRepository doctorRepository,
                            DoctorService doctorService,
                            ConsultationRepository consultationRepository,
                            NotificationRepository notificationRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.doctorService = doctorService;
        this.consultationRepository = consultationRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse admin() {
        LocalDate today = LocalDate.now();
        return new AdminDashboardResponse(
                patientRepository.count(),
                userRepository.count(),
                doctorRepository.count(),
                appointmentRepository.countByDate(today),
                appointmentRepository.countByStatus(AppointmentStatus.PENDING),
                appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED),
                appointmentRepository.countByStatus(AppointmentStatus.CANCELLED),
                patientRepository.countByAccountStatus(AccountStatus.PENDING)
        );
    }

    @Transactional(readOnly = true)
    public DoctorDashboardResponse doctor(AuthPrincipal principal) {
        Doctor doctor = doctorService.findByUserId(principal.id());
        LocalDate today = LocalDate.now();
        List<Appointment> todayAppointments = appointmentRepository.findByDoctorIdAndDate(doctor.getId(), today);
        long urgentToday = todayAppointments.stream().filter(Appointment::isUrgent).count();
        return new DoctorDashboardResponse(
                todayAppointments.size(),
                urgentToday,
                consultationRepository.countByDoctorId(doctor.getId()),
                todayAppointments.stream().map(AppointmentMapper::toResponse).toList()
        );
    }

    @Transactional(readOnly = true)
    public SecretaryDashboardResponse secretary() {
        LocalDate today = LocalDate.now();
        return new SecretaryDashboardResponse(
                appointmentRepository.countByStatus(AppointmentStatus.PENDING),
                patientRepository.count(),
                patientRepository.countByAccountStatus(AccountStatus.PENDING),
                appointmentRepository.countByDate(today),
                appointmentRepository.countByDateAndStatus(today, AppointmentStatus.CONFIRMED),
                appointmentRepository.countByDateAndStatus(today, AppointmentStatus.CANCELLED)
        );
    }

    @Transactional(readOnly = true)
    public PatientDashboardResponse patient(AuthPrincipal principal) {
        Long patientId = principal.id();
        LocalDate today = LocalDate.now();
        List<Appointment> confirmed = appointmentRepository.findByPatientIdAndStatus(patientId, AppointmentStatus.CONFIRMED);
        List<Appointment> upcoming = confirmed.stream()
                .filter(a -> !a.getDate().isBefore(today))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .toList();
        long pending = appointmentRepository.findByPatientIdAndStatus(patientId, AppointmentStatus.PENDING).size();
        return new PatientDashboardResponse(
                pending,
                confirmed.size(),
                notificationRepository.countByAppointmentPatientId(patientId),
                upcoming.stream().map(AppointmentMapper::toResponse).toList()
        );
    }
}
