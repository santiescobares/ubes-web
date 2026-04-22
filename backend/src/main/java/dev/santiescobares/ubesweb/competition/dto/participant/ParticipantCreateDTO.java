package dev.santiescobares.ubesweb.competition.dto.participant;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.constraints.*;

public record ParticipantCreateDTO(
        @NotNull(message = "Participant role is required")
        ParticipantRole role,
        @NotBlank(message = "First name is required")
        @Size(max = 30, message = "First name is too long")
        String firstName,
        @NotBlank(message = "Last name is required")
        @Size(max = 30, message = "Last name is too long")
        String lastName,
        @NotNull(message = "ID type is required")
        IdType idType,
        @NotBlank(message = "ID number is required")
        @Size(max = 15, message = "ID number is too long")
        String idNumber,
        School school,
        @Min(value = 0, message = "Shirt number must be between 0 and 99")
        @Max(value = 99, message = "Shirt number must be between 0 and 99")
        int shirtNumber,
        @Size(max = 255, message = "Student certificate file name is too long")
        String studentCertificateFileRef,
        @Size(max = 255, message = "Medical certificate file name is too long")
        String medicalCertificateFileRef
) {
}
