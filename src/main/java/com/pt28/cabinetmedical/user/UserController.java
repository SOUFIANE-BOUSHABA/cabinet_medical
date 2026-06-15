package com.pt28.cabinetmedical.user;

import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.user.dto.CreateUserRequest;
import com.pt28.cabinetmedical.user.dto.UpdateUserRequest;
import com.pt28.cabinetmedical.user.dto.UpdateUserStatusRequest;
import com.pt28.cabinetmedical.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "Staff user management (ADMIN only)")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a staff user")
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return service.create(request);
    }

    @GetMapping
    @Operation(summary = "List users (optionally filtered by role)")
    public PageResponse<UserResponse> getAll(@RequestParam(required = false) Role role,
                                             @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(role, pageable), Function.identity());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public UserResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Enable / disable a user")
    public UserResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        return service.updateStatus(id, request);
    }
}
