package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionAddParticipantsEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionRemoveParticipantEvent;
import dev.santiescobares.ubesweb.competition.mapper.ParticipantMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import dev.santiescobares.ubesweb.competition.service.ParticipantService;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserService;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParticipantServiceTest {

    @Mock CompetitionService competitionService;
    @Mock UserService userService;
    @Mock StorageService storageService;
    @Mock ParticipantRepository participantRepository;
    @Mock CompetitionRepository competitionRepository;
    @Mock ParticipantMapper participantMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks ParticipantService participantService;

    private UUID currentUserId;

    @BeforeEach
    void setUp() {
        currentUserId = UUID.randomUUID();
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- addParticipants ---

    @Test
    void addParticipants_whenRegistrationUnavailable_andUserHasNoAuthority_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "test@ubes.com"));

        Competition competition = new Competition();
        competition.setId(1L);
        competition.setRegistrationStatus(RegistrationStatus.SCHEDULED);

        User currentUser = new User();
        currentUser.setRole(Role.USER);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(userService.getCurrentUser()).thenReturn(currentUser);

        ParticipantCreateDTO participantDTO = new ParticipantCreateDTO(
                ParticipantRole.PARTICIPANT, "Juan", "Pérez", IdType.DNI, "12345678", null, 0, null, null
        );

        assertThatThrownBy(() -> participantService.addParticipants(1L, List.of(participantDTO), null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addParticipants_whenRegistrationUnavailable_andUserIsAuthority_proceeds() {
        Competition competition = new Competition();
        competition.setId(1L);
        competition.setRegistrationStatus(RegistrationStatus.SCHEDULED);
        competition.setRequiresMedicalCertificates(false);

        User currentUser = new User();
        currentUser.setRole(Role.SPORT_SECRETARY);

        Participant participant = new Participant();
        ParticipantCreateDTO participantDTO = new ParticipantCreateDTO(
                ParticipantRole.PARTICIPANT, "Juan", "Pérez", IdType.DNI, "12345678", null, 0, null, null
        );

        when(competitionService.getById(1L)).thenReturn(competition);
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(participantMapper.toEntity(participantDTO)).thenReturn(participant);

        participantService.addParticipants(1L, List.of(participantDTO), null, null);

        verify(competitionRepository).save(competition);
        verify(eventPublisher).publishEvent(any(CompetitionAddParticipantsEvent.class));
    }

    @Test
    void addParticipants_withValidData_savesAndPublishesEvent() {
        Competition competition = new Competition();
        competition.setId(1L);
        competition.setRegistrationStatus(RegistrationStatus.AVAILABLE);
        competition.setRequiresMedicalCertificates(false);

        User currentUser = new User();
        currentUser.setRole(Role.USER);

        Participant participant = new Participant();
        ParticipantCreateDTO participantDTO = new ParticipantCreateDTO(
                ParticipantRole.PARTICIPANT, "Ana", "Gómez", IdType.DNI, "87654321", null, 5, null, null
        );

        when(competitionService.getById(1L)).thenReturn(competition);
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(participantMapper.toEntity(participantDTO)).thenReturn(participant);

        participantService.addParticipants(1L, List.of(participantDTO), null, null);

        verify(competitionRepository).save(competition);
        verify(eventPublisher).publishEvent(any(CompetitionAddParticipantsEvent.class));
    }

    // --- removeParticipant ---

    @Test
    void removeParticipant_valid_removesFromCompetitionAndPublishesEvent() {
        Competition competition = new Competition();
        competition.setId(1L);
        Participant participant = new Participant();
        participant.setCompetition(competition);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        participantService.removeParticipant(1L);

        verify(eventPublisher).publishEvent(any(CompetitionRemoveParticipantEvent.class));
    }

    // --- getParticipantDTOs ---

    @Test
    void getParticipantDTOs_returnsMappedPage() {
        Participant participant = new Participant();
        ParticipantDTO dto = mock(ParticipantDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Participant> page = new PageImpl<>(List.of(participant));

        when(participantRepository.findAllByCompetitionId(1L, pageable)).thenReturn(page);
        when(participantMapper.toDTO(participant)).thenReturn(dto);

        Page<ParticipantDTO> result = participantService.getParticipantDTOs(1L, pageable);

        assertThat(result.getContent()).containsExactly(dto);
    }

    // --- getById ---

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        when(participantRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> participantService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
