package dev.santiescobares.ubesweb.event;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.event.dto.EventCreateDTO;
import dev.santiescobares.ubesweb.event.dto.EventDTO;
import dev.santiescobares.ubesweb.event.dto.EventUpdateDTO;
import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.event.event.EventCreateEvent;
import dev.santiescobares.ubesweb.event.event.EventDeleteEvent;
import dev.santiescobares.ubesweb.event.event.EventUpdateEvent;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.util.FileUtil;
import dev.santiescobares.ubesweb.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
public class EventService {

    private static final long MAX_BANNER_FILE_SIZE = 10_485_760;

    private final StorageService storageService;

    private final EventRepository eventRepository;

    private final EventMapper eventMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    public EventDTO createEvent(EventCreateDTO dto, MultipartFile bannerFile) {
        if (dto.type() == EventType.COMPETITION) {
            throw new IllegalArgumentException("Invalid endpoint for competition events");
        }
        if (dto.endingDate().isBefore(dto.startingDate())) {
            throw new IllegalArgumentException("Invalid event starting/ending dates");
        }

        Event event = eventMapper.toEntity(dto);

        if (bannerFile != null && !bannerFile.isEmpty()) {
            FileUtil.validateExtension(bannerFile, ImageUtil.IMAGE_FORMATS);
            FileUtil.validateSize(bannerFile.getSize(), MAX_BANNER_FILE_SIZE);

            String bannerKey = storageService.uploadFile(bannerFile, s3Config.getPublicBucket(), R2_EVENT_BANNERS_PATH);
            event.setBannerKey(bannerKey);
        }

        eventRepository.save(event);

        eventPublisher.publishEvent(new EventCreateEvent(RequestContextHolder.getCurrentSession().userId(), event));

        return eventMapper.toDTO(event);
    }

    public EventDTO updateEvent(Long id, EventUpdateDTO dto, MultipartFile newBannerFile, Boolean removeBanner) {
        if (dto.type() != null && dto.type() == EventType.COMPETITION) {
            throw new IllegalArgumentException("Invalid endpoint for competition events");
        }

        Event event = getById(id);

        LocalDateTime startingDate = dto.startingDate();
        LocalDateTime endingDate = dto.endingDate();
        if (
                (startingDate != null && endingDate != null && endingDate.isBefore(startingDate))
                || (startingDate != null && startingDate.isAfter(event.getEndingDate()))
                || (endingDate != null && endingDate.isBefore(event.getStartingDate()))
        ) {
            throw new IllegalArgumentException("Invalid event starting/ending dates");
        }

        eventMapper.updateFromDTO(event, dto);

        if (removeBanner != null && removeBanner) {
            event.setBannerKey(null);
        } else {
            if (newBannerFile != null && !newBannerFile.isEmpty()) {
                FileUtil.validateExtension(newBannerFile, ImageUtil.IMAGE_FORMATS);
                FileUtil.validateSize(newBannerFile.getSize(), MAX_BANNER_FILE_SIZE);

                String bannerKey = storageService.uploadFile(newBannerFile, s3Config.getPublicBucket(), R2_EVENT_BANNERS_PATH);
                event.setBannerKey(bannerKey);
            }
        }

        eventPublisher.publishEvent(new EventUpdateEvent(RequestContextHolder.getCurrentSession().userId(), event));

        return eventMapper.toDTO(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = getById(id);

        eventRepository.delete(event);

        eventPublisher.publishEvent(new EventDeleteEvent(RequestContextHolder.getCurrentSession().userId(), event));
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getEvents(Long id, LocalDateTime from, LocalDateTime to) {
        List<Event> events = new ArrayList<>();
        if (id != null) {
            events.add(getById(id));
        }
        if (from != null || to != null) {
            if (from == null) from = LocalDateTime.now();
            if (to == null) to = LocalDateTime.now().plusDays(30);

            events.addAll(eventRepository.findAllByStartingDateAfterAndEndingDateBefore(from, to));
        }
        return eventMapper.toDTOList(events);
    }

    public Event getById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.EVENT));
    }
}
