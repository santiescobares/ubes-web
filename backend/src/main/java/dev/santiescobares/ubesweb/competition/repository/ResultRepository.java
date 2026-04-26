package dev.santiescobares.ubesweb.competition.repository;

import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.id.ResultId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, ResultId> {

    List<Result> findAllByCompetitionId(Long competitionId);
}
