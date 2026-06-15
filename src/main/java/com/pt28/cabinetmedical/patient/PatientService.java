package com.pt28.cabinetmedical.patient;

import com.pt28.cabinetmedical.common.exception.BusinessRuleException;
import com.pt28.cabinetmedical.common.exception.DuplicateResourceException;
import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import com.pt28.cabinetmedical.patient.dto.CreatePatientRequest;
import com.pt28.cabinetmedical.patient.dto.PatientResponse;
import com.pt28.cabinetmedical.patient.dto.RegisterPatientRequest;
import com.pt28.cabinetmedical.patient.dto.UpdatePatientRequest;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(PatientRepository patientRepository,
                          MedicalRecordRepository medicalRecordRepository,
                          PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Public self-registration: account starts PENDING and a medical record is auto-created (rule 12). */
    @Transactional
    public PatientResponse register(RegisterPatientRequest request) {
        requireUniqueCin(request.cin());
        Patient patient = Patient.builder()
                .cin(request.cin())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .email(request.email())
                .birthDate(request.birthDate())
                .address(request.address())
                .gender(request.gender())
                .passwordHash(passwordEncoder.encode(request.password()))
                .accountStatus(AccountStatus.PENDING)
                .build();
        patient = patientRepository.save(patient);
        createMedicalRecord(patient);
        return PatientMapper.toResponse(patient);
    }

    /** Staff create: the account is APPROVED immediately. */
    @Transactional
    public PatientResponse create(CreatePatientRequest request) {
        requireUniqueCin(request.cin());
        Patient patient = Patient.builder()
                .cin(request.cin())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .email(request.email())
                .birthDate(request.birthDate())
                .address(request.address())
                .gender(request.gender())
                .passwordHash(passwordEncoder.encode(request.password()))
                .accountStatus(AccountStatus.APPROVED)
                .approvedAt(LocalDateTime.now())
                .build();
        patient = patientRepository.save(patient);
        createMedicalRecord(patient);
        return PatientMapper.toResponse(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getAll(Pageable pageable) {
        return patientRepository.findAll(pageable).map(PatientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> search(String keyword, Pageable pageable) {
        String value = keyword == null ? "" : keyword.trim();
        return patientRepository.search(value, pageable).map(PatientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getPending(Pageable pageable) {
        return patientRepository.findByAccountStatus(AccountStatus.PENDING, pageable).map(PatientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(Long id, AuthPrincipal principal) {
        enforceOwnership(id, principal);
        return PatientMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public PatientResponse getByCin(String cin) {
        Patient patient = patientRepository.findByCin(cin)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with CIN: " + cin));
        return PatientMapper.toResponse(patient);
    }

    @Transactional
    public PatientResponse update(Long id, UpdatePatientRequest request, AuthPrincipal principal) {
        enforceOwnership(id, principal);
        Patient patient = findEntity(id);
        // Patients may only edit contact fields; staff may edit everything (rule 7.6).
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setAddress(request.address());
        if (principal.isStaff()) {
            patient.setFirstName(request.firstName());
            patient.setLastName(request.lastName());
            patient.setBirthDate(request.birthDate());
            patient.setGender(request.gender());
        }
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", id);
        }
        patientRepository.deleteById(id);
    }

    @Transactional
    public PatientResponse approve(Long id) {
        Patient patient = findEntity(id);
        if (patient.getAccountStatus() == AccountStatus.APPROVED) {
            throw new BusinessRuleException("Patient account is already approved");
        }
        patient.setAccountStatus(AccountStatus.APPROVED);
        patient.setApprovedAt(LocalDateTime.now());
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse reject(Long id) {
        Patient patient = findEntity(id);
        patient.setAccountStatus(AccountStatus.REJECTED);
        patient.setApprovedAt(null);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    public Patient findEntity(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    private void requireUniqueCin(String cin) {
        if (patientRepository.existsByCin(cin)) {
            throw new DuplicateResourceException("A patient already exists with CIN: " + cin);
        }
    }

    private void createMedicalRecord(Patient patient) {
        if (!medicalRecordRepository.existsByPatientId(patient.getId())) {
            medicalRecordRepository.save(MedicalRecord.builder().patient(patient).build());
        }
    }

    /** A patient may only access their own record (business rules 2, 3, 13.4). */
    private void enforceOwnership(Long patientId, AuthPrincipal principal) {
        if (principal.isPatient() && !principal.id().equals(patientId)) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's data");
        }
    }
}
