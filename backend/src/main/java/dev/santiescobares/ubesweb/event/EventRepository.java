package dev.santiescobares.ubesweb.event;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByStartingDateAfterAndEndingDateBefore(LocalDateTime startingDate, LocalDateTime endingDate);

    @Query("""
        SELECT e FROM Event e
        WHERE TYPE(e) != dev.santiescobares.ubesweb.competition.entity.Competition
        AND e.endingDate >= :now
        ORDER BY e.startingDate ASC
    """)
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("""
        SELECT e FROM Event e
        WHERE (:id IS NULL OR e.id = :id)
        AND (cast(:name as text) IS NULL OR LOWER(e.name) LIKE CONCAT('%', cast(:name as text), '%'))
        AND (cast(:from as timestamp) IS NULL OR e.endingDate >= :from)
        AND (cast(:to as timestamp) IS NULL OR e.startingDate <= :to)
        ORDER BY e.startingDate ASC
    """)
    List<Event> findAllByFilters(@Param("id") Long id,
            @Param("name") String name,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
