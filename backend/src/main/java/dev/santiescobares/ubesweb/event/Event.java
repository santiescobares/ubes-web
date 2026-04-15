package dev.santiescobares.ubesweb.event;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.Location;
import dev.santiescobares.ubesweb.model.loggable.CULoggableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public class Event extends CULoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EventType type;
    @Column(unique = true, length = 50)
    private String name;
    @Column(length = 1000)
    private String description;

    private LocalDateTime startingDate, endingDate;

    @Embedded
    private Location location;

    private String bannerKey;
}
