package dev.santiescobares.ubesweb.suggestion.repository;

import dev.santiescobares.ubesweb.suggestion.SuggestionVote;
import dev.santiescobares.ubesweb.suggestion.id.SuggestionVoteId;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SuggestionVoteRepository extends JpaRepository<SuggestionVote, SuggestionVoteId> {

    @Query("SELECT v.suggestion.id, COUNT(v), COUNT(CASE WHEN v.inFavor = true THEN 1 END) " +
            "FROM SuggestionVote v " +
            "WHERE v.suggestion.id IN :suggestionIds " +
            "GROUP BY v.suggestion.id"
    )
    List<Object[]> getVoteStatsBySuggestionIds(@Param("suggestionIds") List<Long> suggestionIds);
}
