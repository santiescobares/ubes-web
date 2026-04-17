package dev.santiescobares.ubesweb.user.dto;

import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.enums.School;

import java.time.Instant;
import java.util.UUID;

public record UserDTO(
        UUID id,
        Instant createdAt,
        Instant updatedAt,
        String firstName,
        String lastName,
        String email,
        Role role,
        School school,
        String pictureURL,
        boolean active
) {
}
