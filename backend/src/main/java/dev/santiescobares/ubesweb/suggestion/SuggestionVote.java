package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "suggestion_votes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_suggestion_vote_voter", columnNames = {"suggestion_id", "voter_id"})
        },
        indexes = {
                @Index(name = "idx_suggestion_vote_voters", columnList = "voter_id")
        }
)
@Getter
@Setter
public class SuggestionVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggestion_id", nullable = false)
    private Suggestion suggestion;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    private User voter;

    private Instant timestamp;
    private boolean inFavor;

    @Override
    public String toString() {
        return "SuggestionVote{" +
                "id=" + id +
                ", timestamp=" + timestamp +
                ", inFavor=" + inFavor +
                '}';
    }
}
