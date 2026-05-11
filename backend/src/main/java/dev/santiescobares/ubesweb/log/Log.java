package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.loggableentity.CLoggableEntity;
import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "logs", indexes = {
        @Index(name = "idx_log_user_ids", columnList = "user_id"),
        @Index(name = "idx_log_resources", columnList = "resource_type, resource_id")
})
@Getter
@Setter
public class Log extends CLoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @SequenceGenerator(sequenceName = "logs_seq", allocationSize = 100)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;
    private String resourceId;

    @Enumerated(EnumType.STRING)
    private Action action;
    @Column(columnDefinition = "TEXT")
    private String details;
}
