package dev.santiescobares.ubesweb.competition.dto;

import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.document.dto.DocumentDTO;
import dev.santiescobares.ubesweb.model.location.LocationDTO;

import java.time.Instant;
import java.time.LocalDateTime;

public record CompetitionDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        String name,
        String description,
        LocalDateTime startingDate,
        LocalDateTime endingDate,
        LocationDTO location,
        String bannerURL,
        DocumentDTO regulationDocument,
        int minParticipants,
        int maxParticipants,
        boolean requiresShirtNumbers,
        boolean requiresMedicalCertificates,
        LocalDateTime registrationStartingDate,
        LocalDateTime registrationEndingDate,
        RegistrationStatus registrationStatus,
        CompetitionStatus status
) {
}
