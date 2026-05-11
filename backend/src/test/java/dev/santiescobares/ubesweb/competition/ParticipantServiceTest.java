package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionAddParticipantsEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionRemoveParticipantEvent;
import dev.santiescobares.ubesweb.competition.mapper.ParticipantMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import dev.santiescobares.ubesweb.competition.service.ParticipantService;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserService;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.enums.School;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    // --- addParticipant (individual, para authority) ---

    @Test
    void addParticipant_withDuplicateDocument_throwsResourceAlreadyExistsException() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "12345678", null);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "12345678"))
                .thenReturn(true);

        assertThatThrownBy(() -> participantService.addParticipant(1L, dto, null, null))
                .isInstanceOf(ResourceAlreadyExistsException.class);
    }

    @Test
    void addParticipant_withMaxCoachesExceeded_throwsInvalidOperationException() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        competition.setMaxCoaches(1);

        Participant existingCoach = new Participant();
        existingCoach.setRole(ParticipantRole.COACH);
        existingCoach.setSchool(School.ENET);
        competition.addParticipant(existingCoach);

        ParticipantCreateDTO dto = participantDTO(ParticipantRole.COACH, IdType.DNI, "99999999", School.ENET);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "99999999"))
                .thenReturn(false);

        assertThatThrownBy(() -> participantService.addParticipant(1L, dto, null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addParticipant_withValidData_savesAndPublishesEvent() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        competition.setMaxCoaches(5);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "12345678", School.ENET);
        Participant participant = new Participant();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "12345678"))
                .thenReturn(false);
        when(participantMapper.toEntity(dto)).thenReturn(participant);
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.addParticipant(1L, dto, null, null);

        verify(competitionRepository).save(competition);
        verify(eventPublisher).publishEvent(any(CompetitionAddParticipantsEvent.class));
    }

    // --- addParticipants (bulk, para delegate) ---

    @Test
    void addParticipants_whenRegistrationUnavailable_throwsInvalidOperationException() {
        Competition competition = competition(1L, RegistrationStatus.UNAVAILABLE);
        when(competitionService.getById(1L)).thenReturn(competition);

        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "12345678", null);

        assertThatThrownBy(() -> participantService.addParticipants(1L, List.of(dto), null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addParticipants_withValidData_savesAndPublishesEvent() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        competition.setMaxCoaches(5);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "87654321", School.ENET);
        Participant participant = new Participant();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "87654321"))
                .thenReturn(false);
        when(participantMapper.toEntity(dto)).thenReturn(participant);

        participantService.addParticipants(1L, List.of(dto), null, null);

        verify(competitionRepository).save(competition);
        verify(eventPublisher).publishEvent(any(CompetitionAddParticipantsEvent.class));
    }

    // --- removeParticipant ---

    @Test
    void removeParticipant_valid_removesFromCompetitionAndPublishesEvent() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(competition);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        participantService.removeParticipant(1L, 1L);

        verify(eventPublisher).publishEvent(any(CompetitionRemoveParticipantEvent.class));
    }

    @Test
    void removeParticipant_participantBelongsToDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Competition other = competition(2L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(other);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        assertThatThrownBy(() -> participantService.removeParticipant(1L, 1L))
                .isInstanceOf(InvalidOperationException.class);
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

    // --- DELEGATE scope guard ---

    @Test
    void addParticipant_delegateFromSameSchool_succeeds() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        competition.setMaxCoaches(5);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "11111111", School.ENET);
        Participant participant = new Participant();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "11111111")).thenReturn(false);
        when(participantMapper.toEntity(dto)).thenReturn(participant);
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.addParticipant(1L, dto, null, null);

        verify(competitionRepository).save(competition);
    }

    @Test
    void addParticipant_delegateFromDifferentSchool_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "22222222", School.SAN_JOSE);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));

        assertThatThrownBy(() -> participantService.addParticipant(1L, dto, null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void updateParticipant_delegateFromSameSchool_succeeds() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);

        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.updateParticipant(1L, 1L, dto, null, null);

        verify(participantRepository).save(participant);
    }

    @Test
    void updateParticipant_delegateFromDifferentSchool_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.SAN_JOSE);

        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));

        assertThatThrownBy(() -> participantService.updateParticipant(1L, 1L, dto, null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void removeParticipant_delegateFromSameSchool_succeeds() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));

        participantService.removeParticipant(1L, 1L);

        verify(eventPublisher).publishEvent(any(CompetitionRemoveParticipantEvent.class));
    }

    @Test
    void removeParticipant_delegateFromDifferentSchool_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DELEGATE, "delegate@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.SAN_JOSE);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(userService.getCurrentUser()).thenReturn(userWithSchool(School.ENET));

        assertThatThrownBy(() -> participantService.removeParticipant(1L, 1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addParticipant_executiveIsNotConstrainedByDelegateScope() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "exec@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE);
        competition.setMaxCoaches(5);
        ParticipantCreateDTO dto = participantDTO(ParticipantRole.PARTICIPANT, IdType.DNI, "33333333", School.SAN_JOSE);
        Participant participant = new Participant();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(1L, IdType.DNI, "33333333")).thenReturn(false);
        when(participantMapper.toEntity(dto)).thenReturn(participant);
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.addParticipant(1L, dto, null, null);

        verify(competitionRepository).save(competition);
        verifyNoInteractions(userService);
    }

    // --- A3: validateCompetitionStatus — ventana EXECUTIVE ---

    @Test
    void updateParticipant_executive_unavailableScheduled_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "exec@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.UNAVAILABLE, CompetitionStatus.SCHEDULED);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);
        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        assertThatThrownBy(() -> participantService.updateParticipant(1L, 1L, dto, null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void updateParticipant_executive_expiredScheduled_succeeds() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "exec@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.EXPIRED, CompetitionStatus.SCHEDULED);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);
        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.updateParticipant(1L, 1L, dto, null, null);

        verify(participantRepository).save(participant);
    }

    @Test
    void updateParticipant_executive_available_succeeds() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "exec@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.AVAILABLE, CompetitionStatus.SCHEDULED);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);
        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(participantMapper.toDTO(participant)).thenReturn(mock(ParticipantDTO.class));

        participantService.updateParticipant(1L, 1L, dto, null, null);

        verify(participantRepository).save(participant);
    }

    @Test
    void updateParticipant_executive_expiredOngoing_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "exec@ubes.com"));
        Competition competition = competition(1L, RegistrationStatus.EXPIRED, CompetitionStatus.ONGOING);
        Participant participant = new Participant();
        participant.setCompetition(competition);
        participant.setSchool(School.ENET);
        ParticipantUpdateDTO dto = new ParticipantUpdateDTO(null, null, null, null, null, null, null, null, null);

        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        assertThatThrownBy(() -> participantService.updateParticipant(1L, 1L, dto, null, null))
                .isInstanceOf(InvalidOperationException.class);
    }

    // --- helpers ---

    private Competition competition(Long id, RegistrationStatus registrationStatus) {
        Competition competition = new Competition();
        competition.setId(id);
        competition.setRegistrationStatus(registrationStatus);
        competition.setRequiresMedicalCertificates(false);
        return competition;
    }

    private Competition competition(Long id, RegistrationStatus registrationStatus, CompetitionStatus status) {
        Competition competition = competition(id, registrationStatus);
        competition.setStatus(status);
        return competition;
    }

    private ParticipantCreateDTO participantDTO(ParticipantRole role, IdType idType, String idNumber, School school) {
        return new ParticipantCreateDTO(role, "Juan", "Pérez", idType, idNumber, school, 0, null, null);
    }

    private User userWithSchool(School school) {
        User user = new User();
        user.setSchool(school);
        return user;
    }
}
