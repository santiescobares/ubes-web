package dev.santiescobares.ubesweb.punishment;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentCreateDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentRemoveDTO;
import dev.santiescobares.ubesweb.punishment.event.PunishmentCreateEvent;
import dev.santiescobares.ubesweb.punishment.event.PunishmentRemoveEvent;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PunishmentServiceTest {

    @Mock UserService userService;
    @Mock PunishmentRepository punishmentRepository;
    @Mock PunishmentMapper punishmentMapper;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks PunishmentService punishmentService;

    private UUID currentUserId;
    private UUID targetUserId;

    @BeforeEach
    void setUp() {
        currentUserId = UUID.randomUUID();
        targetUserId = UUID.randomUUID();
        // DEVELOPER tiene autoridad EXECUTIVE (weight 4), por encima de USER (NONE, weight 1)
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "admin@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- createPunishment ---

    @Test
    void createPunishment_whenCallerHasNoAuthorityOverTarget_throwsInvalidOperationException() {
        // Caller is USER (NONE), target is DEVELOPER (EXECUTIVE) — no authority
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "user@ubes.com"));

        User target = new User();
        target.setId(targetUserId);
        target.setRole(Role.DEVELOPER);

        when(userService.getById(targetUserId)).thenReturn(target);

        assertThatThrownBy(() -> punishmentService.createPunishment(
                new PunishmentCreateDTO(targetUserId, "Motivo", 0)))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("punish");
    }

    @Test
    void createPunishment_whenTargetAlreadyPunished_throwsInvalidOperationException() {
        User target = new User();
        target.setId(targetUserId);
        target.setRole(Role.USER);

        when(userService.getById(targetUserId)).thenReturn(target);
        when(punishmentRepository.hasActivePunishments(eq(targetUserId), any(LocalDateTime.class))).thenReturn(true);

        assertThatThrownBy(() -> punishmentService.createPunishment(
                new PunishmentCreateDTO(targetUserId, "Motivo", 0)))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("already punished");
    }

    @Test
    void createPunishment_withPermanentPunishment_savesWithoutExpiration() {
        User target = new User();
        target.setId(targetUserId);
        target.setRole(Role.USER);
        User currentUser = new User();
        Punishment punishment = new Punishment();
        punishment.setId(1L);
        PunishmentDTO punishmentDTO = mock(PunishmentDTO.class);

        when(userService.getById(targetUserId)).thenReturn(target);
        when(punishmentRepository.hasActivePunishments(eq(targetUserId), any(LocalDateTime.class))).thenReturn(false);
        when(punishmentMapper.toEntity(any())).thenReturn(punishment);
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(punishmentMapper.toDTO(punishment)).thenReturn(punishmentDTO);

        PunishmentDTO result = punishmentService.createPunishment(
                new PunishmentCreateDTO(targetUserId, "Comportamiento inadecuado", 0));

        assertThat(result).isEqualTo(punishmentDTO);
        assertThat(punishment.getExpiresAt()).isNull();
        assertThat(punishment.getIssuedOn()).isEqualTo(target);
        assertThat(punishment.getIssuedBy()).isEqualTo(currentUser);
        verify(punishmentRepository).save(punishment);
        verify(eventPublisher).publishEvent(any(PunishmentCreateEvent.class));
    }

    @Test
    void createPunishment_withDuration_setsExpiresAt() {
        User target = new User();
        target.setId(targetUserId);
        target.setRole(Role.USER);
        Punishment punishment = new Punishment();
        punishment.setId(1L);

        when(userService.getById(targetUserId)).thenReturn(target);
        when(punishmentRepository.hasActivePunishments(eq(targetUserId), any(LocalDateTime.class))).thenReturn(false);
        when(punishmentMapper.toEntity(any())).thenReturn(punishment);
        when(userService.getCurrentUser()).thenReturn(new User());
        when(punishmentMapper.toDTO(punishment)).thenReturn(mock(PunishmentDTO.class));

        punishmentService.createPunishment(new PunishmentCreateDTO(targetUserId, "Falta grave", 3600));

        assertThat(punishment.getExpiresAt()).isNotNull();
        assertThat(punishment.getExpiresAt()).isAfter(LocalDateTime.now());
    }

    // --- removePunishment ---

    @Test
    void removePunishment_notFound_throwsResourceNotFoundException() {
        when(punishmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> punishmentService.removePunishment(99L, new PunishmentRemoveDTO("Motivo")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removePunishment_whenInactive_throwsInvalidOperationException() {
        Punishment punishment = new Punishment();
        punishment.setId(1L);
        // Marcar como ya removido
        punishment.setRemovedAt(java.time.Instant.now().minusSeconds(100));

        when(punishmentRepository.findById(1L)).thenReturn(Optional.of(punishment));

        assertThatThrownBy(() -> punishmentService.removePunishment(1L, new PunishmentRemoveDTO("Motivo")))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void removePunishment_whenCallerHasNoAuthorityOverTarget_throwsInvalidOperationException() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "user@ubes.com"));

        User issuedOnUser = new User();
        issuedOnUser.setId(UUID.randomUUID());
        issuedOnUser.setRole(Role.DEVELOPER);

        Punishment punishment = new Punishment();
        punishment.setId(1L);
        punishment.setIssuedOn(issuedOnUser);

        when(punishmentRepository.findById(1L)).thenReturn(Optional.of(punishment));

        assertThatThrownBy(() -> punishmentService.removePunishment(1L, new PunishmentRemoveDTO("Motivo")))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("remove");
    }

    @Test
    void removePunishment_valid_removesAndPublishesEvent() {
        User issuedOnUser = new User();
        issuedOnUser.setId(UUID.randomUUID());
        issuedOnUser.setRole(Role.USER);
        User currentUser = new User();

        Punishment punishment = new Punishment();
        punishment.setId(1L);
        punishment.setIssuedOn(issuedOnUser);

        when(punishmentRepository.findById(1L)).thenReturn(Optional.of(punishment));
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(punishmentMapper.toDTO(punishment)).thenReturn(mock(PunishmentDTO.class));

        punishmentService.removePunishment(1L, new PunishmentRemoveDTO("Apelación aceptada"));

        assertThat(punishment.getRemovedAt()).isNotNull();
        assertThat(punishment.getRemovedBy()).isEqualTo(currentUser);
        assertThat(punishment.getRemoveReason()).isEqualTo("Apelación aceptada");
        verify(eventPublisher).publishEvent(any(PunishmentRemoveEvent.class));
    }

    // --- getPunishmentDTOs ---

    @Test
    void getPunishmentDTOs_withNoFilters_returnsAllPunishments() {
        Punishment punishment = new Punishment();
        PunishmentDTO punishmentDTO = mock(PunishmentDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Punishment> page = new PageImpl<>(List.of(punishment));

        when(punishmentRepository.findAll(pageable)).thenReturn(page);
        when(punishmentMapper.toDTO(punishment)).thenReturn(punishmentDTO);

        Page<PunishmentDTO> result = punishmentService.getPunishmentDTOs(pageable, null, null, null);

        assertThat(result.getContent()).containsExactly(punishmentDTO);
        verify(punishmentRepository).findAll(pageable);
    }

    @Test
    void getPunishmentDTOs_withFilters_usesFilteredQuery() {
        Punishment punishment = new Punishment();
        PunishmentDTO punishmentDTO = mock(PunishmentDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Punishment> page = new PageImpl<>(List.of(punishment));

        when(punishmentRepository.findPunishmentsByFilters(1L, null, null, pageable)).thenReturn(page);
        when(punishmentMapper.toDTO(punishment)).thenReturn(punishmentDTO);

        Page<PunishmentDTO> result = punishmentService.getPunishmentDTOs(pageable, 1L, null, null);

        assertThat(result.getContent()).containsExactly(punishmentDTO);
        verify(punishmentRepository).findPunishmentsByFilters(1L, null, null, pageable);
    }

    // --- hasActivePunishments ---

    @Test
    void hasActivePunishments_byUser_delegatesToRepository() {
        User user = new User();
        user.setId(targetUserId);

        when(punishmentRepository.hasActivePunishments(eq(targetUserId), any(LocalDateTime.class))).thenReturn(true);

        boolean result = punishmentService.hasActivePunishments(user);

        assertThat(result).isTrue();
    }
}
