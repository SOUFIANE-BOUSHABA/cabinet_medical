package com.pt28.cabinetmedical.settings;

import com.pt28.cabinetmedical.common.exception.BusinessRuleException;
import com.pt28.cabinetmedical.settings.dto.SettingsResponse;
import com.pt28.cabinetmedical.settings.dto.UpdateSettingsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
public class CabinetSettingsService {

    private final CabinetSettingsRepository repository;

    public CabinetSettingsService(CabinetSettingsRepository repository) {
        this.repository = repository;
    }

    /** Returns the single settings row, creating a default one if missing. */
    @Transactional
    public CabinetSettings getSettingsEntity() {
        return repository.findAll().stream().findFirst()
                .orElseGet(() -> repository.save(CabinetSettings.builder()
                        .dailyAppointmentLimit(20)
                        .openingTime(LocalTime.of(9, 0))
                        .closingTime(LocalTime.of(18, 0))
                        .appointmentDuration(30)
                        .build()));
    }

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {
        return SettingsMapper.toResponse(getSettingsEntity());
    }

    @Transactional
    public SettingsResponse updateSettings(UpdateSettingsRequest request) {
        if (!request.openingTime().isBefore(request.closingTime())) {
            throw new BusinessRuleException("Opening time must be before closing time");
        }
        CabinetSettings settings = getSettingsEntity();
        settings.setDailyAppointmentLimit(request.dailyAppointmentLimit());
        settings.setOpeningTime(request.openingTime());
        settings.setClosingTime(request.closingTime());
        settings.setAppointmentDuration(request.appointmentDuration());
        return SettingsMapper.toResponse(repository.save(settings));
    }
}
