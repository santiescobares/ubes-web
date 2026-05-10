package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CompetitionLifecycleScheduler {

    private final CompetitionService competitionService;

    private final CompetitionRepository competitionRepository;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processCompetitionLifecycle() {
        LocalDateTime now = LocalDateTime.now();

        competitionRepository
                .findAllByRegistrationStatusAndRegistrationStartingDateBefore(RegistrationStatus.SCHEDULED, now)
                .forEach(c -> {
                    try { competitionService.openCompetitionRegistration(c.getId()); }
                    catch (Exception e) { log.error("Error opening registration for competition {}: {}", c.getId(), e.getMessage()); }
                });

        competitionRepository
                .findAllByRegistrationStatusAndRegistrationEndingDateBefore(RegistrationStatus.AVAILABLE, now)
                .forEach(c -> {
                    try { competitionService.closeCompetitionRegistration(c, false); }
                    catch (Exception e) { log.error("Error closing registration for competition {}: {}", c.getId(), e.getMessage()); }
                });

        competitionRepository
                .findAllByStatusAndRegistrationStatusAndStartingDateBefore(CompetitionStatus.SCHEDULED, RegistrationStatus.EXPIRED, now)
                .forEach(c -> {
                    try { competitionService.startCompetition(c.getId()); }
                    catch (Exception e) { log.error("Error starting competition {}: {}", c.getId(), e.getMessage()); }
                });

        competitionRepository
                .findAllByStatusAndEndingDateBefore(CompetitionStatus.ON_GOING, now)
                .forEach(c -> {
                    try { competitionService.endCompetition(c); }
                    catch (Exception e) { log.error("Error ending competition {}: {}", c.getId(), e.getMessage()); }
                });
    }
}
