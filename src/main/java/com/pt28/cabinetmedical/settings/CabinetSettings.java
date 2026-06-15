package com.pt28.cabinetmedical.settings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

/** Single-row cabinet configuration (opening hours, slot duration, daily limit). */
@Entity
@Table(name = "cabinet_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CabinetSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "daily_appointment_limit", nullable = false)
    private Integer dailyAppointmentLimit;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    /** Appointment slot duration in minutes. */
    @Column(name = "appointment_duration", nullable = false)
    private Integer appointmentDuration;
}
