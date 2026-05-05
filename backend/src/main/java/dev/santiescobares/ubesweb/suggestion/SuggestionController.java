package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionCreateDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Global.BASE_URL + "/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    @PostMapping
    public ResponseEntity<SuggestionDTO> create(@RequestBody @Valid SuggestionCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(suggestionService.createSuggestion(dto));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Void> vote(@PathVariable Long id, @RequestParam boolean inFavor) {
        suggestionService.voteSuggestion(id, inFavor);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/hide")
    @PreAuthorize("hasAuthority('EXECUTIVE')")
    public ResponseEntity<Void> hide(@PathVariable Long id) {
        suggestionService.hideSuggestion(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unhide")
    @PreAuthorize("hasAuthority('EXECUTIVE')")
    public ResponseEntity<Void> unhide(@PathVariable Long id) {
        suggestionService.unhideSuggestion(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<SuggestionDTO>> getAll(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(suggestionService.getSuggestionDTOs(pageable));
    }
}
