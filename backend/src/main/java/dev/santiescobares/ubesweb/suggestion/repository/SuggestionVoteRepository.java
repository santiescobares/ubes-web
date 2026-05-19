package dev.santiescobares.ubesweb.suggestion.repository;

import dev.santiescobares.ubesweb.suggestion.SuggestionVote;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface SuggestionVoteRepository extends JpaRepository<SuggestionVote, Long> {

    boolean existsBySuggestionIdAndVoterId(Long suggestionId, UUID voterId);

    @Query("SELECT v.suggestion.id, COUNT(v), COUNT(CASE WHEN v.inFavor = true THEN 1 END) " +
            "FROM SuggestionVote v " +
            "WHERE v.suggestion.id IN :suggestionIds " +
            "GROUP BY v.suggestion.id"
    )
    List<Object[]> getVoteStatsBySuggestionIds(@Param("suggestionIds") List<Long> suggestionIds);

    @Query("SELECT v.suggestion.id, v.inFavor FROM SuggestionVote v " +
            "WHERE v.voter.id = :voterId AND v.suggestion.id IN :suggestionIds")
    List<Object[]> findUserVotesBySuggestionIds(@Param("voterId") UUID voterId,
                                                @Param("suggestionIds") List<Long> suggestionIds);
}
