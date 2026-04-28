package dev.santiescobares.ubesweb.punishment;

import dev.santiescobares.ubesweb.model.loggableentity.CLoggableEntity;
import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "punishments", indexes = {
        @Index(name = "idx_punishment_issued_on", columnList = "issued_on_id"),
        @Index(name = "idx_punishment_issued_by", columnList = "issued_by_id"),
        @Index(name = "idx_punishment_removed_by", columnList = "removed_by_id")
})
@Getter
@Setter
public class Punishment extends CLoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_on_id", nullable = false)
    private User issuedOn;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id", nullable = false)
    private User issuedBy;

    @Column(length = 500)
    private String reason;
    private LocalDateTime expiresAt;

    private Instant removedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by_id")
    private User removedBy;
    @Column(length = 500)
    private String removeReason;

    public boolean isActive() {
        return removedAt == null && (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public void remove(User remover, String reason) {
        removedAt = Instant.now();
        removedBy = remover;
        removeReason = reason;
    }
}
