package dev.santiescobares.ubesweb.event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByStartingDateAfterAndEndingDateBefore(LocalDateTime startingDate, LocalDateTime endingDate);
}
