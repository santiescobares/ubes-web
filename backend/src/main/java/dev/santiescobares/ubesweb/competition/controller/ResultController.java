package dev.santiescobares.ubesweb.competition.controller;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import dev.santiescobares.ubesweb.competition.id.ResultId;
import dev.santiescobares.ubesweb.competition.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/competitions/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @PostMapping("/{competitionId}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> create(@PathVariable Long competitionId, @RequestBody List<@Valid ResultCreateDTO> results) {
        resultService.calculateResults(competitionId, results);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{competitionId}/{positionType}/{positionNumber}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> update(
            @PathVariable Long competitionId,
            @PathVariable ParticipantPositionType positionType,
            @PathVariable Integer positionNumber,
            @RequestBody @Valid ResultUpdateDTO dto
    ) {
        resultService.updateResult(new ResultId(competitionId, positionType, positionNumber), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{competitionId}")
    public ResponseEntity<List<ResultDTO>> getAll(@PathVariable Long competitionId) {
        return ResponseEntity.ok(resultService.findResultDTOs(competitionId));
    }
}
