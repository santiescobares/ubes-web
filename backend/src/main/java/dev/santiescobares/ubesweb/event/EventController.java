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

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(Global.BASE_URL + "/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<EventDTO> createEvent(
            @RequestPart("body") @Valid EventCreateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto, bannerFile));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @RequestPart("body") @Valid EventUpdateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestParam(name = "removeBanner", required = false) Boolean removeBanner
    ) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto, bannerFile, removeBanner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EventDTO>> getEvents(
            @RequestParam(name = "id", required = false) Long id,
            @RequestParam(name = "from", required = false) LocalDateTime from,
            @RequestParam(name = "to", required = false) LocalDateTime to
    ) {
        return ResponseEntity.ok(eventService.getEvents(id, from, to));
    }
}
