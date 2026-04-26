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

    @PostMapping
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> calculateResults(@RequestParam Long competitionId, @RequestBody List<@Valid ResultCreateDTO> results) {
        resultService.calculateResults(competitionId, results);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<ResultDTO> updateResult(
            @RequestParam Long competitionId,
            @RequestParam ParticipantPositionType positionType,
            @RequestParam Integer positionNumber,
            @RequestBody @Valid ResultUpdateDTO dto
    ) {
        resultService.updateResult(new ResultId(competitionId, positionType, positionNumber), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ResultDTO>> getResults(@RequestParam Long competitionId) {
        return ResponseEntity.ok(resultService.getResults(competitionId));
    }
}
