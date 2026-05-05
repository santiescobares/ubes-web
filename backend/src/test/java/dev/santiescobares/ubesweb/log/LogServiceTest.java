package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.log.dto.LogDTO;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
class LogServiceTest {

    @Mock UserRepository userRepository;
    @Mock LogRepository logRepository;
    @Mock LogMapper logMapper;

    @InjectMocks LogService logService;

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

    // --- createLog ---

    @Test
    void createLog_savesEntityWithAllFields() {
        User user = new User();
        when(userRepository.getReferenceById(currentUserId)).thenReturn(user);

        logService.createLog(currentUserId, ResourceType.USER, "user-1", Action.CREATE, "Detalle");

        verify(logRepository).save(argThat(log ->
                log.getUser() == user
                && log.getResourceType() == ResourceType.USER
                && log.getResourceId().equals("user-1")
                && log.getAction() == Action.CREATE
                && log.getDetails().equals("Detalle")
        ));
    }

    @Test
    void createLog_withNullDetails_savesEntityWithNullDetails() {
        when(userRepository.getReferenceById(currentUserId)).thenReturn(new User());

        logService.createLog(currentUserId, ResourceType.POST, "post-5", Action.DELETE, null);

        verify(logRepository).save(argThat(log -> log.getDetails() == null));
    }

    // --- purgeOldLogs ---

    @Test
    void purgeOldLogs_delegatesToRepositoryWithCutOff() {
        when(logRepository.purgeOldLogs(any())).thenReturn(3);

        logService.purgeOldLogs();

        verify(logRepository).purgeOldLogs(any());
    }

    @Test
    void purgeOldLogs_whenNothingDeleted_doesNotLog() {
        when(logRepository.purgeOldLogs(any())).thenReturn(0);

        logService.purgeOldLogs();

        verify(logRepository).purgeOldLogs(any());
    }

    // --- findLogDTOById ---

    @Test
    void findLogDTOById_notFound_throwsResourceNotFoundException() {
        when(logRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> logService.findLogDTOById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findLogDTOById_found_returnsDTO() {
        Log log = new Log();
        log.setId(1L);
        LogDTO logDTO = mock(LogDTO.class);

        when(logRepository.findById(1L)).thenReturn(Optional.of(log));
        when(logMapper.toDTO(log)).thenReturn(logDTO);

        LogDTO result = logService.findLogDTOById(1L);

        assertThat(result).isEqualTo(logDTO);
    }

    // --- findLogDTOs ---

    @Test
    void findLogDTOs_withNoFilters_returnsMappedPage() {
        Log log = new Log();
        log.setId(1L);
        LogDTO logDTO = mock(LogDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Log> page = new PageImpl<>(List.of(log));

        when(logRepository.findLogsByFilters(null, null, null, null, pageable)).thenReturn(page);
        when(logMapper.toDTO(log)).thenReturn(logDTO);

        Page<LogDTO> result = logService.findLogDTOs(null, null, null, null, pageable);

        assertThat(result.getContent()).containsExactly(logDTO);
    }

    @Test
    void findLogDTOs_withFilters_delegatesFiltersToRepository() {
        UUID userId = UUID.randomUUID();
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Log> page = new PageImpl<>(List.of());

        when(logRepository.findLogsByFilters(userId, ResourceType.USER, "user-1", Action.CREATE, pageable))
                .thenReturn(page);

        Page<LogDTO> result = logService.findLogDTOs(userId, ResourceType.USER, "user-1", Action.CREATE, pageable);

        assertThat(result.getContent()).isEmpty();
        verify(logRepository).findLogsByFilters(userId, ResourceType.USER, "user-1", Action.CREATE, pageable);
    }
}
