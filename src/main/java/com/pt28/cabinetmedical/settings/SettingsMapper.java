package com.pt28.cabinetmedical.settings;

import com.pt28.cabinetmedical.settings.dto.SettingsResponse;

/** Maps {@link CabinetSettings} to its response DTO. */
public final class SettingsMapper {

    private SettingsMapper() {
    }

    public static SettingsResponse toResponse(CabinetSettings settings) {
        return new SettingsResponse(
                settings.getId(),
                settings.getDailyAppointmentLimit(),
                settings.getOpeningTime(),
                settings.getClosingTime(),
                settings.getAppointmentDuration()
        );
    }
}
