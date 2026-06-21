package com.pt28.cabinetmedical.doctor;

import com.pt28.cabinetmedical.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Doctor profile attached to a staff {@link User} with role DOCTOR. */
@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 150)
    private String specialty;

    /** Free-text availability description (e.g. "Mon-Fri 09:00-17:00"). */
    @Column(length = 255)
    private String availability;
}
