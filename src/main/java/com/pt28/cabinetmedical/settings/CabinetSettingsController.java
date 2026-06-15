package com.pt28.cabinetmedical.settings;

import com.pt28.cabinetmedical.settings.dto.SettingsResponse;
import com.pt28.cabinetmedical.settings.dto.UpdateSettingsRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@Tag(name = "Cabinet Settings", description = "Opening hours, slot duration and daily appointment limit")
public class CabinetSettingsController {

    private final CabinetSettingsService service;

    public CabinetSettingsController(CabinetSettingsService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Get cabinet settings")
    public SettingsResponse get() {
        return service.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update cabinet settings (ADMIN only)")
    public SettingsResponse update(@Valid @RequestBody UpdateSettingsRequest request) {
        return service.updateSettings(request);
    }
}
