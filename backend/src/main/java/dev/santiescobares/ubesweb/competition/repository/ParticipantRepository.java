package dev.santiescobares.ubesweb.competition.repository;

import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    Page<Participant> findAllByCompetitionId(Long competitionId, Pageable pageable);

    @Query("""
            SELECT p FROM Participant p
            WHERE p.competition.id = :competitionId
            AND (:search IS NULL OR :search = ''
                 OR LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR p.idNumber LIKE CONCAT('%', :search, '%'))
            """)
    Page<Participant> findAllByCompetitionIdWithSearch(
            @Param("competitionId") Long competitionId,
            @Param("search") String search,
            Pageable pageable
    );

    boolean existsByCompetitionIdAndIdTypeAndIdNumber(Long competitionId, IdType idType, String idNumber);

    boolean existsByCompetitionIdAndIdTypeAndIdNumberAndIdNot(Long competitionId, IdType idType, String idNumber, Long id);

    boolean existsByCompetitionIdAndSchoolAndShirtNumber(Long competitionId, School school, Integer shirtNumber);

    boolean existsByCompetitionIdAndSchoolAndShirtNumberAndIdNot(Long competitionId, School school, Integer shirtNumber, Long id);
}
