package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("""
        SELECT l FROM Log l
        WHERE (:id IS NULL OR l.id = :id)
        AND (cast(:userId as uuid) IS NULL OR l.user.id = :userId)
        AND (:resourceType IS NULL OR l.resourceType = :resourceType)
        AND (:resourceId IS NULL OR l.resourceId = :resourceId)
        AND (:action IS NULL OR l.action = :action)
        AND (cast(:from as timestamp) IS NULL OR l.createdAt >= :from)
        AND (cast(:to as timestamp) IS NULL OR l.createdAt <= :to)
    """)
    Page<Log> findLogsByFilters(
            @Param("id") Long id,
            @Param("userId") UUID userId,
            @Param("resourceType") ResourceType resourceType,
            @Param("resourceId") String resourceId,
            @Param("action") Action action,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable
    );

    @Modifying
    @Query("DELETE FROM Log l WHERE l.createdAt < :cutOff")
    int purgeOldLogs(@Param("cutOff") Instant cutOff);
}
