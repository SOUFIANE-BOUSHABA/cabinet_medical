package com.pt28.cabinetmedical.doctor;

import com.pt28.cabinetmedical.common.exception.DuplicateResourceException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.doctor.dto.CreateDoctorRequest;
import com.pt28.cabinetmedical.doctor.dto.DoctorResponse;
import com.pt28.cabinetmedical.doctor.dto.UpdateDoctorRequest;
import com.pt28.cabinetmedical.user.Role;
import com.pt28.cabinetmedical.user.User;
import com.pt28.cabinetmedical.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public DoctorResponse create(CreateDoctorRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("A user already exists with email: " + request.email());
        }
        User user = userRepository.save(User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.DOCTOR)
                .enabled(true)
                .build());
        Doctor doctor = doctorRepository.save(Doctor.builder()
                .user(user)
                .specialty(request.specialty())
                .availability(request.availability())
                .build());
        return DoctorMapper.toResponse(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAll(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(DoctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getById(Long id) {
        return DoctorMapper.toResponse(findEntity(id));
    }

    @Transactional
    public DoctorResponse update(Long id, UpdateDoctorRequest request) {
        Doctor doctor = findEntity(id);
        if (request.specialty() != null) {
            doctor.setSpecialty(request.specialty());
        }
        if (request.availability() != null) {
            doctor.setAvailability(request.availability());
        }
        if (request.name() != null && doctor.getUser() != null) {
            doctor.getUser().setName(request.name());
            userRepository.save(doctor.getUser());
        }
        return DoctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public void delete(Long id) {
        Doctor doctor = findEntity(id);
        Long userId = doctor.getUser() != null ? doctor.getUser().getId() : null;
        doctorRepository.delete(doctor);
        if (userId != null) {
            userRepository.deleteById(userId);
        }
    }

    public Doctor findEntity(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
    }

    public Doctor findByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No doctor profile found for user id: " + userId));
    }
}
