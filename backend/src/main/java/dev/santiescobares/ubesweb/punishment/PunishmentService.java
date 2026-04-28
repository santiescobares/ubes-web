package dev.santiescobares.ubesweb.punishment;

import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentCreateDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentRemoveDTO;
import dev.santiescobares.ubesweb.punishment.event.PunishmentCreateEvent;
import dev.santiescobares.ubesweb.punishment.event.PunishmentRemoveEvent;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PunishmentService {

    private final UserService userService;

    private final PunishmentRepository punishmentRepository;

    private final PunishmentMapper punishmentMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PunishmentDTO createPunishment(PunishmentCreateDTO dto) {
        User target = userService.getById(dto.targetId());
        if (!RequestContextHolder.getCurrentSession().role().getAuthority().surpasses(target.getRole().getAuthority())) {
            throw new InvalidOperationException("You can't punish that user");
        }

        if (hasActivePunishments(target)) {
            throw new InvalidOperationException("User is already punished");
        }

        Punishment punishment = punishmentMapper.toEntity(dto);
        punishment.setIssuedOn(target);
        punishment.setIssuedBy(userService.getCurrentUser());

        if (dto.durationSeconds() > 0) {
            punishment.setExpiresAt(LocalDateTime.now().plusSeconds(dto.durationSeconds()));
        }

        punishmentRepository.save(punishment);

        eventPublisher.publishEvent(new PunishmentCreateEvent(RequestContextHolder.getCurrentSession().userId(), punishment));

        return punishmentMapper.toDTO(punishment);
    }

    @Transactional
    public PunishmentDTO removePunishment(Long id, PunishmentRemoveDTO dto) {
        Punishment punishment = getById(id);
        if (!punishment.isActive()) {
            throw new InvalidOperationException("Punishment is not active");
        }
        if (!RequestContextHolder.getCurrentSession().role().getAuthority().surpasses(punishment.getIssuedOn().getRole().getAuthority())) {
            throw new InvalidOperationException("You can't remove that user's punishment");
        }

        punishment.remove(userService.getCurrentUser(), dto.reason());

        eventPublisher.publishEvent(new PunishmentRemoveEvent(RequestContextHolder.getCurrentSession().userId(), punishment));

        return punishmentMapper.toDTO(punishment);
    }

    @Transactional(readOnly = true)
    public Page<PunishmentDTO> getPunishmentDTOs(Pageable pageable, Long id, UUID issuedOnId, UUID issuedById) {
        Page<Punishment> punishments;

        if (id == null && issuedOnId == null && issuedById == null) {
            punishments = punishmentRepository.findAll(pageable);
        } else {
            punishments = punishmentRepository.findPunishmentsByFilters(id, issuedOnId, issuedById, pageable);
        }

        return punishments.map(punishmentMapper::toDTO);
    }

    private Punishment getById(Long id) {
        return punishmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.PUNISHMENT));
    }

    @Transactional(readOnly = true)
    public boolean hasActivePunishments(UUID userId) {
        return punishmentRepository.hasActivePunishments(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public boolean hasActivePunishments(User user) {
        return hasActivePunishments(user.getId());
    }
}
