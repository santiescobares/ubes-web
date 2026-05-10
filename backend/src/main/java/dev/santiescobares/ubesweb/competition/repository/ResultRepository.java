package dev.santiescobares.ubesweb.competition.repository;

import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findAllByCompetitionId(Long competitionId);

    List<Result> findAllByCompetitionIdAndPositionType(Long competitionId, ParticipantPositionType positionType);

    @Query("SELECT MAX(r.positionNumber) FROM Result r WHERE r.competition.id = :competitionId AND r.positionType = :positionType")
    Optional<Integer> findMaxPositionNumberByCompetitionIdAndPositionType(Long competitionId, ParticipantPositionType positionType);

    List<Result> findAllByIdIn(List<Long> ids);
}
