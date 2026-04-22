package dev.santiescobares.ubesweb.competition.controller;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/competitions/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @PostMapping(path = "/{competitionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION', 'DELEGATE')")
    public ResponseEntity<Void> addParticipants(
            @PathVariable Long competitionId,
            @RequestPart("participants") List<@Valid ParticipantCreateDTO> participants,
            @RequestPart(value = "studentCertificateFiles", required = false) List<MultipartFile> studentCertificateFiles,
            @RequestPart(value = "medicalCertificateFiles", required = false) List<MultipartFile> medicalCertificateFiles
    ) {
        participantService.addParticipants(competitionId, participants, studentCertificateFiles, medicalCertificateFiles);
        return ResponseEntity.ok().build();
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<ParticipantDTO> updateParticipant(
            @PathVariable Long id,
            @RequestPart("body") @Valid ParticipantUpdateDTO dto,
            @RequestPart(value = "studentCertificateFile", required = false) MultipartFile studentCertificateFile,
            @RequestParam(name = "removestudentCertificate", required = false) Boolean removestudentCertificate,
            @RequestPart(value = "medicalCertificateFile", required = false) MultipartFile medicalCertificateFile,
            @RequestParam(name = "removemedicalCertificate", required = false) Boolean removeMedicalCertificate
    ) {
        return ResponseEntity.ok(participantService.updateParticipant(
                id,
                dto,
                studentCertificateFile,
                removestudentCertificate,
                medicalCertificateFile,
                removeMedicalCertificate
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION')")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long id) {
        participantService.removeParticipant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ParticipantDTO>> getParticipants(
            @RequestParam Long competitionId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(participantService.getParticipantDTOs(competitionId, pageable));
    }
}
