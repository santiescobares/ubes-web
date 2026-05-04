package dev.santiescobares.ubesweb.competition.controller;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.dto.CompetitionCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionUpdateDTO;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping(Global.BASE_URL + "/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<CompetitionDTO> createCompetition(
            @RequestPart("body") @Valid CompetitionCreateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestPart(value = "regulationDocumentFile", required = false) MultipartFile regulationDocumentFile
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(competitionService.createCompetition(dto, bannerFile, regulationDocumentFile));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<CompetitionDTO> updateCompetition(
            @PathVariable Long id,
            @RequestPart("body") @Valid CompetitionUpdateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestParam(name = "removeBanner", required = false) Boolean removeBanner,
            @RequestPart(value = "regulationDocumentFile", required = false) MultipartFile regulationDocumentFile,
            @RequestParam(name = "removeRegulationDocument", required = false) Boolean removeRegulationDocument
    ) {
        return ResponseEntity.ok(competitionService.updateCompetition(
                id,
                dto,
                bannerFile,
                removeBanner,
                regulationDocumentFile,
                removeRegulationDocument
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> deleteCompetition(@PathVariable Long id) {
        competitionService.deleteCompetition(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/schedule-registration")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> scheduleCompetitionRegistration(
            @PathVariable Long id,
            @RequestParam LocalDateTime startingDate,
            @RequestParam LocalDateTime endingDate
    ) {
        competitionService.scheduleCompetitionRegistration(id, startingDate, endingDate);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/open-registration")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> openCompetitionRegistration(@PathVariable Long id) {
        competitionService.openCompetitionRegistration(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/close-registration")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> closeCompetitionRegistration(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean cancel
    ) {
        competitionService.closeCompetitionRegistration(id, cancel);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> startCompetition(@PathVariable Long id) {
        competitionService.startCompetition(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/end")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> endCompetition(@PathVariable Long id) {
        competitionService.endCompetition(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> cancelCompetition(@PathVariable Long id) {
        competitionService.cancelCompetition(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitionDTO> getCompetition(@PathVariable Long id) {
        return ResponseEntity.ok(competitionService.getCompetitionDTO(id));
    }

    @GetMapping
    public ResponseEntity<Page<CompetitionDTO>> getCompetitions(
            @PageableDefault(sort = "startingDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(competitionService.getCompetitionDTOs(pageable));
    }
}
