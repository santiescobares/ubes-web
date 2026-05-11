package dev.santiescobares.ubesweb.competition.dto.result;

import jakarta.validation.constraints.Size;

public record ResultUpdateDTO(
        @Size(min = 3, max = 100, message = "Name is either too short or too long")
        String name,
        Long participantId,
        boolean removeParticipant
) {
}
