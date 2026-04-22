package dev.santiescobares.ubesweb.competition.dto.participant;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.constraints.*;

public record ParticipantUpdateDTO(
        ParticipantRole role,
        @Size(max = 30, message = "First name is too long")
        String firstName,
        @Size(max = 30, message = "Last name is too long")
        String lastName,
        IdType idType,
        @Size(max = 15, message = "ID number is too long")
        String idNumber,
        School school,
        @Min(value = 0, message = "Shirt number must be between 0 and 99")
        @Max(value = 99, message = "Shirt number must be between 0 and 99")
        Integer shirtNumber,
        @Size(max = 255, message = "Student certificate file name is too long")
        String studentCertificateFileRef,
        @Size(max = 255, message = "Medical certificate file name is too long")
        String medicalCertificateFileRef
) {
}
