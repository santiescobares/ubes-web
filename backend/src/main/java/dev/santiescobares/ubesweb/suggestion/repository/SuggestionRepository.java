package dev.santiescobares.ubesweb.suggestion.repository;

import dev.santiescobares.ubesweb.suggestion.Suggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    Page<Suggestion> findAllByHiddenAtIsNull(Pageable pageable);

    long countByCreatedAtAfter(Instant cutoff);

    @EntityGraph(attributePaths = {"createdBy"})
    List<Suggestion> findTop8ByHiddenAtIsNullOrderByCreatedAtDesc();

    @Query(value = "SELECT DISTINCT DATE(created_at) AS day FROM suggestions " +
            "WHERE (:includeHidden = TRUE OR hidden_at IS NULL) " +
            "ORDER BY day DESC LIMIT :limit OFFSET :offset",
            nativeQuery = true)
    List<LocalDate> findDistinctDatesPaged(@Param("offset") int offset,
                                           @Param("limit") int limit,
                                           @Param("includeHidden") boolean includeHidden);

    @Query(value = "SELECT COUNT(DISTINCT DATE(created_at)) FROM suggestions " +
            "WHERE (:includeHidden = TRUE OR hidden_at IS NULL)",
            nativeQuery = true)
    long countDistinctDates(@Param("includeHidden") boolean includeHidden);

    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT s FROM Suggestion s WHERE " +
            "(:includeHidden = TRUE OR s.hiddenAt IS NULL) AND " +
            "CAST(s.createdAt AS LocalDate) IN :dates " +
            "ORDER BY s.createdAt DESC")
    List<Suggestion> findAllByDates(@Param("dates") List<LocalDate> dates,
                                    @Param("includeHidden") boolean includeHidden);
}
