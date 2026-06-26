package com.pt28.cabinetmedical.consultation;

import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.consultation.dto.ConsultationResponse;
import com.pt28.cabinetmedical.consultation.dto.CreateConsultationRequest;
import com.pt28.cabinetmedical.consultation.dto.UpdateConsultationRequest;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorService;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorService doctorService;

    public ConsultationService(ConsultationRepository consultationRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               DoctorService doctorService) {
        this.consultationRepository = consultationRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.doctorService = doctorService;
    }

    /** Only a DOCTOR may create a consultation (business rule 11). */
    @Transactional
    public ConsultationResponse create(CreateConsultationRequest request, AuthPrincipal principal) {
        if (!principal.hasRole(Role.DOCTOR)) {
            throw new ForbiddenAccessException("Only a doctor can create a consultation");
        }
        Doctor doctor = doctorService.findByUserId(principal.id());
        MedicalRecord record = medicalRecordRepository.findById(request.medicalRecordId())
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", request.medicalRecordId()));

        Consultation consultation = Consultation.builder()
                .medicalRecord(record)
                .doctor(doctor)
                .consultationDate(request.consultationDate())
                .diagnosis(request.diagnosis())
                .notes(request.notes())
                .treatment(request.treatment())
                .build();
        consultation = consultationRepository.save(consultation);

        record.setUpdatedAt(LocalDateTime.now());
        medicalRecordRepository.save(record);

        return ConsultationMapper.toResponse(consultation);
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getById(Long id) {
        return ConsultationMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getByRecord(Long recordId, AuthPrincipal principal) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", recordId));
        if (principal.isPatient()
                && (record.getPatient() == null || !principal.id().equals(record.getPatient().getId()))) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's consultations");
        }
        return consultationRepository.findByMedicalRecordIdOrderByConsultationDateDesc(recordId).stream()
                .map(ConsultationMapper::toResponse)
                .toList();
    }

    @Transactional
    public ConsultationResponse update(Long id, UpdateConsultationRequest request, AuthPrincipal principal) {
        if (!principal.hasRole(Role.DOCTOR)) {
            throw new ForbiddenAccessException("Only a doctor can update a consultation");
        }
        Consultation consultation = findEntity(id);
        consultation.setConsultationDate(request.consultationDate());
        consultation.setDiagnosis(request.diagnosis());
        consultation.setNotes(request.notes());
        consultation.setTreatment(request.treatment());
        return ConsultationMapper.toResponse(consultationRepository.save(consultation));
    }

    @Transactional
    public void delete(Long id) {
        if (!consultationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Consultation", id);
        }
        consultationRepository.deleteById(id);
    }

    private Consultation findEntity(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", id));
    }
}
