package dev.santiescobares.ubesweb.punishment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PunishmentCreateDTO(
        @NotNull(message = "Target ID is required")
        UUID targetId,
        @NotBlank(message = "Reason is required")
        @Size(max = 500, message = "Reason is too long")
        String reason,
        @PositiveOrZero(message = "Duration seconds must be positive")
        long durationSeconds
) {
}
