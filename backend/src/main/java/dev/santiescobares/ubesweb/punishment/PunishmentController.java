package dev.santiescobares.ubesweb.punishment;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentCreateDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentRemoveDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(Global.BASE_URL + "/punishments")
@RequiredArgsConstructor
public class PunishmentController {

    private final PunishmentService punishmentService;

    @PostMapping
    public ResponseEntity<PunishmentDTO> createPunishment(@RequestBody @Valid PunishmentCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(punishmentService.createPunishment(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PunishmentDTO> removePunishment(@PathVariable Long id, @RequestBody @Valid PunishmentRemoveDTO dto) {
        return ResponseEntity.ok().body(punishmentService.removePunishment(id, dto));
    }

    @GetMapping
    public ResponseEntity<Page<PunishmentDTO>> getPunishments(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) UUID issuedOnId,
            @RequestParam(required = false) UUID issuedById,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(punishmentService.getPunishmentDTOs(pageable, id, issuedOnId, issuedById));
    }
}
