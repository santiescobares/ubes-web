package dev.santiescobares.ubesweb.punishment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PunishmentRemoveDTO(
        @NotBlank(message = "Reason is required")
        @Size(min = 10, max = 500, message = "Reason is either too short or too long")
        String reason
) {
}
