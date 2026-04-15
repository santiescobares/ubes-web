package dev.santiescobares.ubesweb.competition.id;

import dev.santiescobares.ubesweb.competition.Competition;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResultId implements Serializable {

    private Long competitionId;
    @Enumerated(EnumType.STRING)
    private ParticipantPositionType positionType;
    private Integer positionNumber;

    public ResultId(Competition competition, ParticipantPositionType positionType, Integer positionNumber) {
        this(competition.getId(), positionType, positionNumber);
    }
}
