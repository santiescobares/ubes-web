package dev.santiescobares.ubesweb.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCreateDTO(
        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title is too long")
        String title,
        @NotBlank(message = "Body is required")
        @Size(min = 10, max = 100, message = "Body is either too short or too long")
        String body
) {
}
