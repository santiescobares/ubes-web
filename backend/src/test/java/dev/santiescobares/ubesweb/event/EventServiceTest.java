package dev.santiescobares.ubesweb.event;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.event.dto.EventCreateDTO;
import dev.santiescobares.ubesweb.event.dto.EventDTO;
import dev.santiescobares.ubesweb.event.dto.EventUpdateDTO;
import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.event.event.EventCreateEvent;
import dev.santiescobares.ubesweb.event.event.EventDeleteEvent;
import dev.santiescobares.ubesweb.event.event.EventUpdateEvent;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock StorageService storageService;
    @Mock EventRepository eventRepository;
    @Mock EventMapper eventMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks EventService eventService;

    @BeforeEach
    void setUp() {
        RequestContextHolder.setCurrentSession(new RequestContextData(UUID.randomUUID(), Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- createEvent ---

    @Test
    void createEvent_withCompetitionType_throwsIllegalArgumentException() {
        EventCreateDTO dto = new EventCreateDTO(
                EventType.COMPETITION, "Torneo", null,
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(2), null
        );

        assertThatThrownBy(() -> eventService.createEvent(dto, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("competition");
    }

    @Test
    void createEvent_withEndBeforeStart_throwsIllegalArgumentException() {
        EventCreateDTO dto = new EventCreateDTO(
                EventType.SPECIAL, "Festival", null,
                LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(1), null
        );

        assertThatThrownBy(() -> eventService.createEvent(dto, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dates");
    }

    @Test
    void createEvent_withValidData_savesAndReturnsDTO() {
        EventCreateDTO dto = new EventCreateDTO(
                EventType.SPECIAL, "Festival de Arte", null,
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(3), null
        );
        Event event = new Event();
        event.setId(1L);
        EventDTO eventDTO = mock(EventDTO.class);

        when(eventMapper.toEntity(dto)).thenReturn(event);
        when(eventMapper.toDTO(event)).thenReturn(eventDTO);

        EventDTO result = eventService.createEvent(dto, null);

        assertThat(result).isEqualTo(eventDTO);
        verify(eventRepository).save(event);
        verify(eventPublisher).publishEvent(any(EventCreateEvent.class));
    }

    // --- updateEvent ---

    @Test
    void updateEvent_withCompetitionType_throwsIllegalArgumentException() {
        EventUpdateDTO dto = new EventUpdateDTO(EventType.COMPETITION, null, null, null, null, null);

        assertThatThrownBy(() -> eventService.updateEvent(1L, dto, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("competition");
    }

    @Test
    void updateEvent_withEndBeforeStart_throwsIllegalArgumentException() {
        Event event = new Event();
        event.setId(1L);
        event.setStartingDate(LocalDateTime.now().plusDays(1));
        event.setEndingDate(LocalDateTime.now().plusDays(5));
        EventUpdateDTO dto = new EventUpdateDTO(null, null, null,
                LocalDateTime.now().plusDays(4), LocalDateTime.now().plusDays(2), null);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.updateEvent(1L, dto, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dates");
    }

    @Test
    void updateEvent_notFound_throwsResourceNotFoundException() {
        EventUpdateDTO dto = new EventUpdateDTO(null, null, null, null, null, null);
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.updateEvent(99L, dto, null, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateEvent_withRemoveBanner_clearsBannerKey() {
        Event event = new Event();
        event.setId(1L);
        event.setBannerKey("old-banner-key");
        EventUpdateDTO dto = new EventUpdateDTO(null, null, null, null, null, null);
        EventDTO eventDTO = mock(EventDTO.class);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventMapper.toDTO(event)).thenReturn(eventDTO);

        eventService.updateEvent(1L, dto, null, true);

        assertThat(event.getBannerKey()).isNull();
        verify(eventPublisher).publishEvent(any(EventUpdateEvent.class));
    }

    @Test
    void updateEvent_withValidData_savesAndPublishesEvent() {
        Event event = new Event();
        event.setId(1L);
        EventUpdateDTO dto = new EventUpdateDTO(null, "Nuevo Nombre", null, null, null, null);
        EventDTO eventDTO = mock(EventDTO.class);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventMapper.toDTO(event)).thenReturn(eventDTO);

        EventDTO result = eventService.updateEvent(1L, dto, null, null);

        assertThat(result).isEqualTo(eventDTO);
        verify(eventRepository).save(event);
        verify(eventPublisher).publishEvent(any(EventUpdateEvent.class));
    }

    // --- deleteEvent ---

    @Test
    void deleteEvent_notFound_throwsResourceNotFoundException() {
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.deleteEvent(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteEvent_valid_deletesAndPublishesEvent() {
        Event event = new Event();
        event.setId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        eventService.deleteEvent(1L);

        verify(eventRepository).delete(event);
        verify(eventPublisher).publishEvent(any(EventDeleteEvent.class));
    }

    // --- getEvents ---

    @Test
    void getEvents_byId_returnsSingleEvent() {
        Event event = new Event();
        event.setId(1L);
        EventDTO eventDTO = mock(EventDTO.class);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventMapper.toDTOList(List.of(event))).thenReturn(List.of(eventDTO));

        List<EventDTO> result = eventService.getEvents(1L, null, null);

        assertThat(result).containsExactly(eventDTO);
    }

    @Test
    void getEvents_byDateRange_returnsFilteredEvents() {
        Event event = new Event();
        event.setId(2L);
        LocalDateTime from = LocalDateTime.now();
        LocalDateTime to = LocalDateTime.now().plusDays(7);
        EventDTO eventDTO = mock(EventDTO.class);

        when(eventRepository.findAllByStartingDateAfterAndEndingDateBefore(from, to)).thenReturn(List.of(event));
        when(eventMapper.toDTOList(List.of(event))).thenReturn(List.of(eventDTO));

        List<EventDTO> result = eventService.getEvents(null, from, to);

        assertThat(result).containsExactly(eventDTO);
    }

    @Test
    void getEvents_withNoParams_returnsEmptyList() {
        when(eventMapper.toDTOList(List.of())).thenReturn(List.of());

        List<EventDTO> result = eventService.getEvents(null, null, null);

        assertThat(result).isEmpty();
    }
}
