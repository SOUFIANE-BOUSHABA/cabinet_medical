package com.pt28.cabinetmedical.user;

import com.pt28.cabinetmedical.common.exception.DuplicateResourceException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.doctor.Doctor;
import com.pt28.cabinetmedical.doctor.DoctorRepository;
import com.pt28.cabinetmedical.user.dto.CreateUserRequest;
import com.pt28.cabinetmedical.user.dto.UpdateUserRequest;
import com.pt28.cabinetmedical.user.dto.UpdateUserStatusRequest;
import com.pt28.cabinetmedical.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, DoctorRepository doctorRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("A user already exists with email: " + request.email());
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .enabled(true)
                .build();
        user = userRepository.save(user);
        ensureDoctorProfile(user);
        return UserMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAll(Role role, Pageable pageable) {
        Page<User> users = (role != null)
                ? userRepository.findByRole(role, pageable)
                : userRepository.findAll(pageable);
        return users.map(UserMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserMapper.toResponse(findEntity(id));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = findEntity(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("A user already exists with email: " + request.email());
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user = userRepository.save(user);
        ensureDoctorProfile(user);
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateStatus(Long id, UpdateUserStatusRequest request) {
        User user = findEntity(id);
        user.setEnabled(request.enabled());
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.deleteById(id);
    }

    private User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    /** Keeps a Doctor profile in sync so DOCTOR users can be referenced by appointments/consultations. */
    private void ensureDoctorProfile(User user) {
        if (user.getRole() == Role.DOCTOR && !doctorRepository.existsByUserId(user.getId())) {
            doctorRepository.save(Doctor.builder().user(user).build());
        }
    }
}
