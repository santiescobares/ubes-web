package dev.santiescobares.ubesweb.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "Google ID Token is required")
        String googleIdToken
) {
}
