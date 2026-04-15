package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.loggable.CLoggableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "logs")
@Getter
@Setter
public class Log extends CLoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(sequenceName = "logs_seq", allocationSize = 100)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;
    private String resourceId;

    @Enumerated(EnumType.STRING)
    private Action action;
    @Column(columnDefinition = "TEXT")
    private String details;
}
