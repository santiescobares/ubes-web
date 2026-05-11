package dev.santiescobares.ubesweb.competition.dto.participant;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.constraints.*;

public record ParticipantUpdateDTO(
        ParticipantRole role,
        @Size(min = 3, max = 30, message = "First name is either too short or too long")
        String firstName,
        @Size(min = 3, max = 30, message = "Last name is either too short or too long")
        String lastName,
        IdType idType,
        @Size(max = 15, message = "ID number is too long")
        String idNumber,
        School school,
        @Min(value = 0, message = "Shirt number must be between 0 and 99")
        @Max(value = 99, message = "Shirt number must be between 0 and 99")
        Integer shirtNumber,
        Boolean removeStudentCertificate,
        Boolean removeMedicalCertificate
) {
}
