package dev.santiescobares.ubesweb.user.dto;

import dev.santiescobares.ubesweb.enums.Role;
import java.util.UUID;

public record UserSnapshotDTO(
        UUID id,
        String firstName,
        String lastName,
        Role role,
        String pictureURL
) {
}
