package dev.santiescobares.ubesweb.competition.dto.result;

import jakarta.validation.constraints.Size;

public record ResultUpdateDTO(
        @Size(max = 100, message = "Name is too long")
        String name,
        Long participantId,
        boolean removeParticipant
) {
}
