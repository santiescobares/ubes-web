package dev.santiescobares.ubesweb.competition.entity;

import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.event.Event;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(
        name = "competitions",
        check = {
                @CheckConstraint(name = "participants_check", constraint = "min_participants > 0 " +
                        "AND max_participants >= 1 " +
                        "AND min_participants <= 99 " +
                        "AND max_participants <= 99"),
                @CheckConstraint(name = "coaches_check", constraint = "max_coaches >= 0 AND max_coaches <= 99")
        },
        indexes = {
                @Index(name = "idx_competition_regulation_documents", columnList = "regulation_document_id")
        }
)
@Getter
@Setter
public class Competition extends Event {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regulation_document_id")
    private Document regulationDocument;

    private int minParticipants, maxParticipants;
    private int maxCoaches;
    private boolean requiresShirtNumbers, requiresMedicalCertificates;

    private LocalDateTime registrationStartingDate, registrationEndingDate;
    @Enumerated(EnumType.STRING)
    private RegistrationStatus registrationStatus;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus status;

    @OneToMany(mappedBy = "competition", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants;
    @OneToMany(mappedBy = "competition", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Result> results;

    public List<Participant> getParticipants() {
        return participants != null ? Collections.unmodifiableList(participants) : Collections.emptyList();
    }

    public boolean addParticipant(Participant participant) {
        if (participants == null) {
            participants = new ArrayList<>();
        }
        participant.setCompetition(this);
        return participants.add(participant);
    }

    public boolean removeParticipant(Participant participant) {
        if (participants == null) return false;
        return participants.remove(participant);
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Competition)) return false;
        return ((Competition) obj).getId().equals(getId());
    }

    @Override
    public String toString() {
        return "Competition{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", type=" + getType() +
                ", startingDate=" + getStartingDate() +
                ", endingDate=" + getEndingDate() +
                ", minParticipants=" + minParticipants +
                ", maxParticipants=" + maxParticipants +
                ", maxCoaches=" + maxCoaches +
                ", requiresShirtNumbers=" + requiresShirtNumbers +
                ", requiresMedicalCertificates=" + requiresMedicalCertificates +
                ", registrationStartingDate=" + registrationStartingDate +
                ", registrationEndingDate=" + registrationEndingDate +
                ", registrationStatus=" + registrationStatus +
                ", status=" + status +
                '}';
    }
}
