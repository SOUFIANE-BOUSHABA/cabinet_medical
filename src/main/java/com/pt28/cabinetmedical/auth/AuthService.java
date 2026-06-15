package com.pt28.cabinetmedical.auth;

import com.pt28.cabinetmedical.auth.dto.*;
import com.pt28.cabinetmedical.common.exception.AccountNotActiveException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.patient.AccountStatus;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.patient.dto.PatientResponse;
import com.pt28.cabinetmedical.patient.PatientService;
import com.pt28.cabinetmedical.patient.dto.RegisterPatientRequest;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import com.pt28.cabinetmedical.security.JwtService;
import com.pt28.cabinetmedical.security.PrincipalType;
import com.pt28.cabinetmedical.user.Role;
import com.pt28.cabinetmedical.user.User;
import com.pt28.cabinetmedical.user.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientService patientService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       PatientService patientService,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.patientService = patientService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /** Staff login with email + password (ADMIN / DOCTOR / SECRETARY). */
    @Transactional(readOnly = true)
    public AuthResponse staffLogin(StaffLoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new AccountNotActiveException("This account is disabled");
        }
        if (user.getRole() == Role.PATIENT) {
            throw new BadCredentialsException("Patients must use the patient login");
        }
        AuthPrincipal principal = new AuthPrincipal(user.getId(), user.getEmail(), user.getRole(), PrincipalType.STAFF);
        return buildAuthResponse(principal, user.getName());
    }

    /** Patient login with CIN + password. The account must be APPROVED. */
    @Transactional(readOnly = true)
    public AuthResponse patientLogin(PatientLoginRequest request) {
        Patient patient = patientRepository.findByCin(request.cin())
                .orElseThrow(() -> new BadCredentialsException("Invalid CIN or password"));
        if (!passwordEncoder.matches(request.password(), patient.getPasswordHash())) {
            throw new BadCredentialsException("Invalid CIN or password");
        }
        if (patient.getAccountStatus() != AccountStatus.APPROVED) {
            throw new AccountNotActiveException("Your account is " + patient.getAccountStatus()
                    + ". Please wait for validation by the cabinet staff.");
        }
        AuthPrincipal principal = new AuthPrincipal(patient.getId(), patient.getCin(), Role.PATIENT, PrincipalType.PATIENT);
        return buildAuthResponse(principal, patient.getFirstName() + " " + patient.getLastName());
    }

    @Transactional
    public PatientResponse register(RegisterPatientRequest request) {
        return patientService.register(request);
    }

    /** Re-issues an access token from a valid refresh token. */
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        AuthPrincipal principal;
        try {
            if (!jwtService.isRefreshToken(request.refreshToken())) {
                throw new BadCredentialsException("Provided token is not a refresh token");
            }
            principal = jwtService.parse(request.refreshToken());
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        return buildAuthResponse(principal, resolveDisplayName(principal));
    }

    @Transactional(readOnly = true)
    public MeResponse me(AuthPrincipal principal) {
        if (principal.type() == PrincipalType.STAFF) {
            User user = userRepository.findById(principal.id())
                    .orElseThrow(() -> new ResourceNotFoundException("User", principal.id()));
            return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getEmail(),
                    user.getRole(), PrincipalType.STAFF);
        }
        Patient patient = patientRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", principal.id()));
        return new MeResponse(patient.getId(), patient.getCin(),
                patient.getFirstName() + " " + patient.getLastName(), patient.getEmail(),
                Role.PATIENT, PrincipalType.PATIENT);
    }

    private AuthResponse buildAuthResponse(AuthPrincipal principal, String displayName) {
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);
        return new AuthResponse(
                "Bearer",
                accessToken,
                refreshToken,
                jwtService.getAccessExpirationMs() / 1000,
                principal.id(),
                principal.username(),
                displayName,
                principal.role(),
                principal.type()
        );
    }

    private String resolveDisplayName(AuthPrincipal principal) {
        if (principal.type() == PrincipalType.STAFF) {
            return userRepository.findById(principal.id()).map(User::getName).orElse(principal.username());
        }
        return patientRepository.findById(principal.id())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse(principal.username());
    }
}
