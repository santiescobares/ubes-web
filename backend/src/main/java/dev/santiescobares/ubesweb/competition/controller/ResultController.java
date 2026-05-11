package dev.santiescobares.ubesweb.competition.controller;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import dev.santiescobares.ubesweb.competition.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/competitions/{competitionId}/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping
    public ResponseEntity<List<ResultDTO>> getAll(@PathVariable Long competitionId) {
        return ResponseEntity.ok(resultService.findResultDTOs(competitionId));
    }

    @GetMapping("/{positionType}")
    public ResponseEntity<List<ResultDTO>> getByType(
            @PathVariable Long competitionId,
            @PathVariable ParticipantPositionType positionType
    ) {
        return ResponseEntity.ok(resultService.findResultDTOsByType(competitionId, positionType));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EXECUTIVE')")
    public ResponseEntity<ResultDTO> create(
            @PathVariable Long competitionId,
            @RequestBody @Valid ResultCreateDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resultService.addResult(competitionId, dto));
    }

    @PutMapping("/{resultId}")
    @PreAuthorize("hasAuthority('EXECUTIVE')")
    public ResponseEntity<ResultDTO> update(
            @PathVariable Long competitionId,
            @PathVariable Long resultId,
            @RequestBody @Valid ResultUpdateDTO dto
    ) {
        return ResponseEntity.ok(resultService.updateResult(resultId, dto));
    }

    @DeleteMapping("/{resultId}")
    @PreAuthorize("hasAuthority('EXECUTIVE')")
    public ResponseEntity<Void> delete(@PathVariable Long competitionId, @PathVariable Long resultId) {
        resultService.deleteResult(resultId);
        return ResponseEntity.noContent().build();
    }
}
