package dev.santiescobares.ubesweb.punishment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PunishmentRemoveDTO(
        @NotBlank(message = "Reason is required")
        @Size(max = 500, message = "Reason is too long")
        String reason
) {
}
