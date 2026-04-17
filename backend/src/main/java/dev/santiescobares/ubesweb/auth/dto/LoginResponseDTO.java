package dev.santiescobares.ubesweb.auth.dto;

import dev.santiescobares.ubesweb.user.dto.UserDTO;

public record LoginResponseDTO(
        String registrationToken,
        UserDTO user
) {
}
