package dev.santiescobares.ubesweb.user.dto;

import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateDTO(
        @NotBlank(message = "First name is required")
        @Size(min = 3, max = 30, message = "First name is either too short or too long")
        String firstName,
        @NotBlank(message = "Last name is required")
        @Size(min = 3, max = 30, message = "Last name is either too short or too long")
        String lastName,
        @NotNull(message = "School is required")
        School school,
        @NotBlank(message = "Registration token is required")
        String registrationToken
) {
}
