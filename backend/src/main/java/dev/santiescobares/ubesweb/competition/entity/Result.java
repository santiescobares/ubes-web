package dev.santiescobares.ubesweb.competition.entity;

import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "competition_results",
        check = {
                @CheckConstraint(name = "position_number_check", constraint = "position_number > 0")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_result_competition_type_position", columnNames = {"competition_id", "position_type", "position_number"})
        },
        indexes = {
                @Index(name = "idx_competition_result_competitions", columnList = "competition_id"),
                @Index(name = "idx_competition_result_participants", columnList = "participant_id")
        }
)
@Getter
@Setter
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Enumerated(EnumType.STRING)
    @Column(name = "position_type", nullable = false)
    private ParticipantPositionType positionType;

    @Column(name = "position_number", nullable = false)
    private int positionNumber;

    @Column(length = 100)
    private String name;
    private int points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id")
    private Participant participant;

    @Override
    public String toString() {
        return "Result{" +
                "id=" + id +
                ", positionType=" + positionType +
                ", positionNumber=" + positionNumber +
                ", name='" + name + '\'' +
                ", points=" + points +
                '}';
    }
}
