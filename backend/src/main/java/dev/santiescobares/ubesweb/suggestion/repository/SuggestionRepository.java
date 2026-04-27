package dev.santiescobares.ubesweb.suggestion.repository;

import dev.santiescobares.ubesweb.suggestion.Suggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    Page<Suggestion> findAllByHiddenAtIsNull(Pageable pageable);
}
