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

import java.util.UUID;

@RestController
@RequestMapping(Global.BASE_URL + "/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/{id}")
    public ResponseEntity<LogDTO> getLog(@PathVariable Long id) {
        return ResponseEntity.ok(logService.getLogDTO(id));
    }

    @GetMapping
    public ResponseEntity<Page<LogDTO>> getLogs(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) Action action,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(logService.getLogs(userId, resourceType, resourceId, action, pageable));
    }
}
