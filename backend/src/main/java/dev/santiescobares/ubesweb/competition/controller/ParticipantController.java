package dev.santiescobares.ubesweb.competition.controller;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.competition.service.ParticipantService;
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

import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/competitions/{competitionId}/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION', 'DELEGATE')")
    public ResponseEntity<ParticipantDTO> add(
            @PathVariable Long competitionId,
            @RequestPart("body") @Valid ParticipantCreateDTO dto,
            @RequestPart(value = "studentCertificateFile", required = false) MultipartFile studentCertificateFile,
            @RequestPart(value = "medicalCertificateFile", required = false) MultipartFile medicalCertificateFile
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(participantService.addParticipant(competitionId, dto, studentCertificateFile, medicalCertificateFile));
    }

    @PostMapping(path = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('DELEGATE', 'EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> addBulk(
            @PathVariable Long competitionId,
            @RequestPart("participants") List<@Valid ParticipantCreateDTO> participants,
            @RequestPart(value = "studentCertificateFiles", required = false) List<MultipartFile> studentCertificateFiles,
            @RequestPart(value = "medicalCertificateFiles", required = false) List<MultipartFile> medicalCertificateFiles
    ) {
        participantService.addParticipants(competitionId, participants, studentCertificateFiles, medicalCertificateFiles);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping(path = "/{participantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION', 'DELEGATE')")
    public ResponseEntity<ParticipantDTO> update(
            @PathVariable Long competitionId,
            @PathVariable Long participantId,
            @RequestPart("body") @Valid ParticipantUpdateDTO dto,
            @RequestPart(value = "studentCertificateFile", required = false) MultipartFile studentCertificateFile,
            @RequestPart(value = "medicalCertificateFile", required = false) MultipartFile medicalCertificateFile
    ) {
        return ResponseEntity.ok(participantService.updateParticipant(
                competitionId, participantId, dto, studentCertificateFile, medicalCertificateFile));
    }

    @DeleteMapping("/{participantId}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION', 'DELEGATE')")
    public ResponseEntity<Void> remove(@PathVariable Long competitionId, @PathVariable Long participantId) {
        participantService.removeParticipant(competitionId, participantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ParticipantDTO>> getAll(
            @PathVariable Long competitionId,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ParticipantRole role,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (id != null || search != null || role != null) {
            return ResponseEntity.ok(participantService.getParticipantDTOs(competitionId, id, search, role, pageable));
        }
        return ResponseEntity.ok(participantService.getParticipantDTOs(competitionId, pageable));
    }
}
