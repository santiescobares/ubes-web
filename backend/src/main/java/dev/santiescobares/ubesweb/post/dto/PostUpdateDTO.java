package dev.santiescobares.ubesweb.post.dto;

import jakarta.validation.constraints.Size;

public record PostUpdateDTO(
        @Size(max = 100, message = "Title is too long")
        String title,
        @Size(min = 10, max = 100, message = "Body is either too short or too long")
        String body,
        Boolean hidden
) {
}
