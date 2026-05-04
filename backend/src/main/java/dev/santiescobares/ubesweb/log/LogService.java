package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.log.dto.LogDTO;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogService {

    private final UserRepository userRepository;

    private final LogRepository logRepository;

    private final LogMapper logMapper;

    @Transactional
    public void createLog(UUID userId, ResourceType resourceType, String resourceId, Action action, String details) {
        Log log = new Log();
        log.setUser(userRepository.getReferenceById(userId));
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setAction(action);
        log.setDetails(details);

        logRepository.save(log);
    }

    @Transactional
    @Scheduled(cron = "0 5 4 * * *")
    public void purgeOldLogs() {
        int result = logRepository.purgeOldLogs(Instant.now().minus(15, ChronoUnit.DAYS));
        if (result > 0) {
            log.info("Old logs cleanup performed. {} logs deleted", result);
        }
    }

    @Transactional(readOnly = true)
    public Page<LogDTO> getLogs(UUID userId, ResourceType resourceType, String resourceId, Action action, Pageable pageable) {
        return logRepository.findLogsByFilters(userId, resourceType, resourceId, action, pageable).map(logMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public LogDTO getLogDTO(Long id) {
        return logMapper.toDTO(logRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.LOG)));
    }
}
