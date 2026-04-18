package dev.santiescobares.ubesweb.model.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LocationDTO(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name is too long")
        String name,
        double latitude,
        double longitude
) {
}
