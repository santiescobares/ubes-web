package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.model.loggableentity.CULoggableEntity;
import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "suggestions", indexes = {
        @Index(name = "idx_suggestion_created_by", columnList = "created_by_id"),
        @Index(name = "idx_suggestion_hidden_by", columnList = "hidden_by_id")
})
@Getter
@Setter
public class Suggestion extends CULoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(length = 1000)
    private String content;
    private boolean anonymized;

    private Instant hiddenAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hidden_by_id")
    private User hiddenBy;

    @OneToMany(mappedBy = "suggestion", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SuggestionVote> votes;

    public List<SuggestionVote> getVotes() {
        return votes != null ? Collections.unmodifiableList(votes) : Collections.emptyList();
    }

    public boolean addVote(SuggestionVote vote) {
        if (votes == null) {
            votes = new ArrayList<>();
        }
        vote.setSuggestion(this);
        return votes.add(vote);
    }

    public boolean isHidden() {
        return hiddenAt != null;
    }

    public void hide() {
        hiddenAt = Instant.now();
    }
}
