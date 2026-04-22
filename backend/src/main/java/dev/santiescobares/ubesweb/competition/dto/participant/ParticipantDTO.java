package dev.santiescobares.ubesweb.competition.dto.participant;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;

import java.time.Instant;

public record ParticipantDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        ParticipantRole role,
        String firstName,
        String lastName,
        IdType idType,
        String idNumber,
        School school,
        int shirtNumber
) {
}
