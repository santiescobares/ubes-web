package dev.santiescobares.ubesweb.competition.repository;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    @Query("""
            SELECT c FROM Competition c
            ORDER BY
                CASE c.status
                    WHEN 'SCHEDULED' THEN 0
                    WHEN 'ON_GOING'  THEN 1
                    WHEN 'FINISHED'  THEN 2
                    WHEN 'CANCELED'  THEN 3
                END ASC,
                c.startingDate ASC
            """)
    Page<Competition> findAllOrdered(Pageable pageable);

    List<Competition> findAllByRegistrationStatusAndRegistrationStartingDateBefore(
            RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByRegistrationStatusAndRegistrationEndingDateBefore(
            RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByStatusAndRegistrationStatusAndStartingDateBefore(
            CompetitionStatus status, RegistrationStatus registrationStatus, LocalDateTime now);

    List<Competition> findAllByStatusAndEndingDateBefore(
            CompetitionStatus status, LocalDateTime now);
}
