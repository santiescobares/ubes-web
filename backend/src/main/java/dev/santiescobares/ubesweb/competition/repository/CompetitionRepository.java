package dev.santiescobares.ubesweb.competition.repository;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    @Query("""
        SELECT c FROM Competition c
        WHERE (:id IS NULL OR c.id = :id)
        AND (CAST(:name AS string) IS NULL OR :name = ''
             OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
       """)
    Page<Competition> findAllByFilters(@Param("id") Long id, @Param("name") String name, Pageable pageable);

    List<Competition> findAllByRegistrationStatusAndRegistrationStartingDateIsNotNullAndRegistrationStartingDateBefore(
            RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByRegistrationStatusAndRegistrationEndingDateBefore(
            RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByStatusAndRegistrationStatusAndStartingDateBefore(
            CompetitionStatus status, RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByStatusAndEndingDateBefore(
            CompetitionStatus status, LocalDateTime now);

    @Query("""
        SELECT c FROM Competition c
        WHERE c.status IN ('SCHEDULED', 'ONGOING')
        AND c.endingDate >= :now
        ORDER BY c.startingDate ASC
    """)
    List<Competition> findUpcomingCompetitions(@Param("now") LocalDateTime now, Pageable pageable);
}
