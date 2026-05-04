package dev.santiescobares.ubesweb.document;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.document.dto.DocumentCreateDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentUpdateDTO;
import dev.santiescobares.ubesweb.document.enums.DocumentType;
import dev.santiescobares.ubesweb.document.event.DocumentCreateEvent;
import dev.santiescobares.ubesweb.document.event.DocumentDeleteEvent;
import dev.santiescobares.ubesweb.document.event.DocumentUpdateEvent;
import dev.santiescobares.ubesweb.enums.FileType;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.ResourceAlreadyExistsException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock StorageService storageService;
    @Mock DocumentRepository documentRepository;
    @Mock DocumentMapper documentMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks DocumentService documentService;

    @BeforeEach
    void setUp() {
        RequestContextHolder.setCurrentSession(new RequestContextData(UUID.randomUUID(), Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- createDocumentDinamically ---

    @Test
    void createDocumentDinamically_withNullFile_throwsIllegalArgumentException() {
        DocumentCreateDTO dto = new DocumentCreateDTO("Reglamento", DocumentType.REGULATION);

        assertThatThrownBy(() -> documentService.createDocumentDinamically(dto, null, Set.of("pdf")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createDocumentDinamically_withEmptyFile_throwsIllegalArgumentException() {
        DocumentCreateDTO dto = new DocumentCreateDTO("Reglamento", DocumentType.REGULATION);
        MultipartFile emptyFile = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> documentService.createDocumentDinamically(dto, emptyFile, Set.of("pdf")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createDocumentDinamically_withDuplicateName_throwsResourceAlreadyExistsException() {
        DocumentCreateDTO dto = new DocumentCreateDTO("Reglamento Existente", DocumentType.REGULATION);
        MultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});

        when(documentRepository.existsByNameIgnoreCase("Reglamento Existente")).thenReturn(true);

        assertThatThrownBy(() -> documentService.createDocumentDinamically(dto, file, Set.of("pdf")))
                .isInstanceOf(ResourceAlreadyExistsException.class);
    }

    @Test
    void createDocumentDinamically_withValidData_savesAndPublishesEvent() {
        DocumentCreateDTO dto = new DocumentCreateDTO("Nuevo Doc", DocumentType.REGULATION);
        MultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});
        Document document = new Document();
        document.setId(1L);

        when(documentRepository.existsByNameIgnoreCase("Nuevo Doc")).thenReturn(false);
        when(documentMapper.toEntity(dto)).thenReturn(document);
        when(storageService.uploadRandomFile(any(), any(), anyString())).thenReturn("documents/doc.pdf");
        when(s3Config.getPublicBucket()).thenReturn("public-bucket");

        Document result = documentService.createDocumentDinamically(dto, file, Set.of("pdf"));

        assertThat(result).isEqualTo(document);
        assertThat(document.getKey()).isEqualTo("documents/doc.pdf");
        verify(documentRepository).save(document);
        verify(eventPublisher).publishEvent(any(DocumentCreateEvent.class));
    }

    // --- createDocument (public endpoint, blocks REGULATION type) ---

    @Test
    void createDocument_withRegulationType_throwsIllegalArgumentException() {
        DocumentCreateDTO dto = new DocumentCreateDTO("Doc Bloqueado", DocumentType.REGULATION);
        MultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1});

        assertThatThrownBy(() -> documentService.createDocument(dto, file, Set.of("pdf")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("regulation");
    }

    // --- updateDocumentDynamically ---

    @Test
    void updateDocumentDynamically_withDuplicateName_throwsResourceAlreadyExistsException() {
        Document document = new Document();
        document.setId(1L);
        document.setName("Nombre Original");
        DocumentUpdateDTO dto = new DocumentUpdateDTO("Nombre Duplicado", null);

        when(documentRepository.existsByNameIgnoreCase("Nombre Duplicado")).thenReturn(true);

        assertThatThrownBy(() -> documentService.updateDocumentDynamically(document, dto, null, Set.of("pdf")))
                .isInstanceOf(ResourceAlreadyExistsException.class);
    }

    @Test
    void updateDocumentDynamically_withRegulationType_throwsIllegalArgumentException() {
        Document document = new Document();
        document.setId(1L);
        document.setName("Doc");
        DocumentUpdateDTO dto = new DocumentUpdateDTO(null, DocumentType.REGULATION);

        assertThatThrownBy(() -> documentService.updateDocumentDynamically(document, dto, null, Set.of("pdf")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("regulation");
    }

    @Test
    void updateDocumentDynamically_withValidData_savesAndPublishesEvent() {
        Document document = new Document();
        document.setId(1L);
        document.setName("Doc Original");
        DocumentUpdateDTO dto = new DocumentUpdateDTO("Nuevo Nombre", null);
        DocumentDTO documentDTO = mock(DocumentDTO.class);

        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(documentRepository.existsByNameIgnoreCase("Nuevo Nombre")).thenReturn(false);
        when(documentMapper.toDTO(document)).thenReturn(documentDTO);

        DocumentDTO result = documentService.updateDocument(1L, dto, null);

        assertThat(result).isEqualTo(documentDTO);
        verify(documentRepository).save(document);
        verify(eventPublisher).publishEvent(any(DocumentUpdateEvent.class));
    }

    @Test
    void updateDocumentDynamically_withSameName_doesNotCheckDuplicate() {
        Document document = new Document();
        document.setId(1L);
        document.setName("Mismo Nombre");
        DocumentUpdateDTO dto = new DocumentUpdateDTO("Mismo Nombre", null);

        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(documentMapper.toDTO(document)).thenReturn(mock(DocumentDTO.class));

        documentService.updateDocument(1L, dto, null);

        verify(documentRepository, never()).existsByNameIgnoreCase("Mismo Nombre");
    }

    // --- deleteDocument ---

    @Test
    void deleteDocument_byId_notFound_throwsResourceNotFoundException() {
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.deleteDocument(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteDocument_byEntity_deletesAndPublishesEvent() {
        Document document = new Document();
        document.setId(1L);

        documentService.deleteDocument(document);

        verify(documentRepository).delete(document);
        verify(eventPublisher).publishEvent(any(DocumentDeleteEvent.class));
    }

    // --- getDocumentDTO ---

    @Test
    void getDocumentDTO_notFound_throwsResourceNotFoundException() {
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getDocumentDTO(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getDocumentDTO_found_returnsDTO() {
        Document document = new Document();
        DocumentDTO documentDTO = mock(DocumentDTO.class);

        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(documentMapper.toDTO(document)).thenReturn(documentDTO);

        DocumentDTO result = documentService.getDocumentDTO(1L);

        assertThat(result).isEqualTo(documentDTO);
    }

    // --- getDocumentDTOs ---

    @Test
    void getDocumentDTOs_returnsMappedPage() {
        Document document = new Document();
        DocumentDTO documentDTO = mock(DocumentDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Document> page = new PageImpl<>(List.of(document));

        when(documentRepository.findAll(pageable)).thenReturn(page);
        when(documentMapper.toDTO(document)).thenReturn(documentDTO);

        Page<DocumentDTO> result = documentService.getDocumentDTOs(pageable);

        assertThat(result.getContent()).containsExactly(documentDTO);
    }
}
