package dev.santiescobares.ubesweb.document;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.document.dto.DocumentCreateDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentUpdateDTO;
import dev.santiescobares.ubesweb.document.event.DocumentCreateEvent;
import dev.santiescobares.ubesweb.document.event.DocumentDeleteEvent;
import dev.santiescobares.ubesweb.document.event.DocumentUpdateEvent;
import dev.santiescobares.ubesweb.enums.FileType;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final Set<String> FORMATS;
    private static final long MAX_FILE_SIZE = 26_214_400;

    private final StorageService storageService;

    private final DocumentRepository documentRepository;

    private final DocumentMapper documentMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    public Document createDocumentDinamically(DocumentCreateDTO dto, MultipartFile documentFile, Set<String> allowedFormats) {
        if (documentFile == null || documentFile.isEmpty()) {
            throw new IllegalArgumentException("Document file can't be null or empty");
        }

        Document document = documentMapper.toEntity(dto);
        checkFileAndComplete(documentFile, allowedFormats, document);

        String key = storageService.uploadRandomFile(documentFile, s3Config.getPublicBucket(), R2_DOCUMENTS_PATH);
        document.setKey(key);

        documentRepository.save(document);

        eventPublisher.publishEvent(new DocumentCreateEvent(RequestContextHolder.getCurrentSession().userId(), document));

        return document;
    }

    public DocumentDTO createDocument(DocumentCreateDTO dto, MultipartFile documentFile, Set<String> allowedFormats) {
        Document document = createDocumentDinamically(dto, documentFile, allowedFormats);
        return documentMapper.toDTO(document);
    }

    public DocumentDTO createDocument(DocumentCreateDTO dto, MultipartFile documentFile) {
        return createDocument(dto, documentFile, FORMATS);
    }

    public Document updateDocumentDynamically(
            Document document,
            DocumentUpdateDTO dto,
            MultipartFile newDocumentFile,
            Set<String> allowedFormats
    ) {
        documentMapper.updateFromDTO(document, dto);

        if (newDocumentFile != null && !newDocumentFile.isEmpty()) {
            checkFileAndComplete(newDocumentFile, allowedFormats, document);

            String key = storageService.uploadRandomFile(newDocumentFile, s3Config.getPublicBucket(), R2_DOCUMENTS_PATH);
            document.setKey(key);
        }

        documentRepository.save(document);

        eventPublisher.publishEvent(new DocumentUpdateEvent(RequestContextHolder.getCurrentSession().userId(), document));

        return document;
    }

    public Document updateDocumentDynamically(Long id, DocumentUpdateDTO dto, MultipartFile newDocumentFile, Set<String> allowedFormats) {
        return updateDocumentDynamically(getById(id), dto, newDocumentFile, allowedFormats);
    }

    public DocumentDTO updateDocument(Long id, DocumentUpdateDTO dto, MultipartFile newDocumentFile, Set<String> allowedFormats) {
        Document document = updateDocumentDynamically(id, dto, newDocumentFile, allowedFormats);
        return documentMapper.toDTO(document);
    }

    public DocumentDTO updateDocument(Long id, DocumentUpdateDTO dto, MultipartFile newDocumentFile) {
        return updateDocument(id, dto, newDocumentFile, FORMATS);
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = getById(id);

        documentRepository.delete(document);

        eventPublisher.publishEvent(new DocumentDeleteEvent(RequestContextHolder.getCurrentSession().userId(), document));
    }

    @Transactional
    public void deleteDocument(Document document) {
        documentRepository.delete(document);

        eventPublisher.publishEvent(new DocumentDeleteEvent(RequestContextHolder.getCurrentSession().userId(), document));
    }

    @Transactional(readOnly = true)
    public DocumentDTO getDocumentDTO(Long id) {
        return documentMapper.toDTO(getById(id));
    }

    private Document getById(Long id) {
        return documentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.DOCUMENT));
    }

    private void checkFileAndComplete(MultipartFile file, Set<String> allowedFormats, Document document) {
        FileUtil.validateExtension(file, allowedFormats);
        FileUtil.validateSize(file, MAX_FILE_SIZE);

        document.setFileType(FileType.getByExtensionName(StringUtils.getFilenameExtension(file.getOriginalFilename())));
        document.setSize(file.getSize());
    }

    static {
        FORMATS = Stream.of(FileType.values())
                .map(FileType::getExtensionName)
                .collect(Collectors.toSet());
    }
}
