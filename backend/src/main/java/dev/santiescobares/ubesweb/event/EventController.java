package dev.santiescobares.ubesweb.event;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.event.dto.EventCreateDTO;
import dev.santiescobares.ubesweb.event.dto.EventDTO;
import dev.santiescobares.ubesweb.event.dto.EventUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<EventDTO> create(
            @RequestPart("body") @Valid EventCreateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto, bannerFile));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<EventDTO> update(
            @PathVariable Long id,
            @RequestPart("body") @Valid EventUpdateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestParam(required = false) Boolean removeBanner
    ) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto, bannerFile, removeBanner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAll(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        LocalDateTime fromLdt = from != null ? from.toLocalDateTime() : null;
        LocalDateTime toLdt = to != null ? to.toLocalDateTime() : null;
        return ResponseEntity.ok(eventService.findEventDTOs(id, name, fromLdt, toLdt));
    }
}
