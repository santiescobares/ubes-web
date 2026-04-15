package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.id.ResultId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "competition_results", indexes = {
        @Index(name = "idx_competition_result_competitions", columnList = "competition_id"),
        @Index(name = "idx_competition_result_participants", columnList = "participant_id")
})
@Getter
@Setter
public class Result {

    @EmbeddedId
    private ResultId resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("competitionId")
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Column(length = 100)
    private String name;
    private int points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id")
    private Participant participant;
}
