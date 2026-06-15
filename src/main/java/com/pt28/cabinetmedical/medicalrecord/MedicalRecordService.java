package com.pt28.cabinetmedical.medicalrecord;

import com.pt28.cabinetmedical.common.exception.DuplicateResourceException;
import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.medicalrecord.dto.CreateMedicalRecordRequest;
import com.pt28.cabinetmedical.medicalrecord.dto.MedicalRecordResponse;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository, PatientRepository patientRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getAll(Pageable pageable) {
        return medicalRecordRepository.findAll(pageable).map(MedicalRecordMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getById(Long id, AuthPrincipal principal) {
        MedicalRecord record = findEntity(id);
        enforceOwnership(record, principal);
        return MedicalRecordMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getByPatientId(Long patientId, AuthPrincipal principal) {
        if (principal.isPatient() && !principal.id().equals(patientId)) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's medical record");
        }
        MedicalRecord record = medicalRecordRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No medical record found for patient id: " + patientId));
        return MedicalRecordMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMyRecord(AuthPrincipal principal) {
        MedicalRecord record = medicalRecordRepository.findByPatientId(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("No medical record found for the current patient"));
        return MedicalRecordMapper.toResponse(record);
    }

    @Transactional
    public MedicalRecordResponse create(CreateMedicalRecordRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", request.patientId()));
        if (medicalRecordRepository.existsByPatientId(patient.getId())) {
            throw new DuplicateResourceException("This patient already has a medical record");
        }
        MedicalRecord record = medicalRecordRepository.save(MedicalRecord.builder().patient(patient).build());
        return MedicalRecordMapper.toResponse(record);
    }

    public MedicalRecord findEntity(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", id));
    }

    private void enforceOwnership(MedicalRecord record, AuthPrincipal principal) {
        if (principal.isPatient()
                && (record.getPatient() == null || !principal.id().equals(record.getPatient().getId()))) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's medical record");
        }
    }
}
