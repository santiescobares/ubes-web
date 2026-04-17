package dev.santiescobares.ubesweb.user.dto;

import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(
        @Size(min = 3, max = 30, message = "First name is either too short or too long")
        String firstName,
        @Size(min = 3, max = 30, message = "Last name is either too short or too long")
        String lastName,
        School school
) {
}
