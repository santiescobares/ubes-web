package dev.santiescobares.ubesweb.suggestion.id;

import dev.santiescobares.ubesweb.suggestion.Suggestion;
import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuggestionVoteId implements Serializable {

    private Long suggestionId;
    private UUID voterId;

    public SuggestionVoteId(Suggestion suggestion, User voter) {
        this(suggestion.getId(), voter.getId());
    }
}
