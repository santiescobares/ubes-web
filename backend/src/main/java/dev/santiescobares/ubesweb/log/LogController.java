package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.dto.LogDTO;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping(Global.BASE_URL + "/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/{id}")
    public ResponseEntity<LogDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(logService.findLogDTOById(id));
    }

    @GetMapping
    public ResponseEntity<Page<LogDTO>> getAll(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) Action action,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(logService.findLogDTOs(id, userId, resourceType, resourceId, action, from, to, pageable));
    }
}
