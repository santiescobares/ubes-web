package dev.santiescobares.ubesweb.context;

import dev.santiescobares.ubesweb.enums.Role;

import java.util.UUID;

public record RequestContextData(
        UUID userId,
        Role role,
        String email
) {
}
