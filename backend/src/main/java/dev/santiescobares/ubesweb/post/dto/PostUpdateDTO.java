package dev.santiescobares.ubesweb.post.dto;

import jakarta.validation.constraints.Size;

public record PostUpdateDTO(
        @Size(min = 1, max = 100, message = "Title is either too short or too long")
        String title,
        @Size(min = 10, max = 10000, message = "Body is either too short or too long")
        String body
) {
}
