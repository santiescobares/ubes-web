package dev.santiescobares.ubesweb.document;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.document.dto.DocumentCreateDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(Global.BASE_URL + "/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE')")
    public ResponseEntity<DocumentDTO> createDocument(
            @RequestPart("body") @Valid DocumentCreateDTO dto,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.createDocument(dto, file));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE')")
    public ResponseEntity<DocumentDTO> updateDocument(
            @PathVariable Long id,
            @RequestPart("body") @Valid DocumentUpdateDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(documentService.updateDocument(id, dto, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentDTO(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('EXECUTIVE')")
    public ResponseEntity<Page<DocumentDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentDTOs(pageable));
    }
}
