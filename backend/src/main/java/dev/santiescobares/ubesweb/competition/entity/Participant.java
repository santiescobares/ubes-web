package dev.santiescobares.ubesweb.competition.entity;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.IdType;
import dev.santiescobares.ubesweb.enums.School;
import dev.santiescobares.ubesweb.model.loggableentity.CULoggableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "competition_participants", indexes = {
        @Index(name = "idx_competition_participant_competitions", columnList = "competition_id")
})
@Getter
@Setter
public class Participant extends CULoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Enumerated(EnumType.STRING)
    private ParticipantRole role;
    @Column(length = 30)
    private String firstName, lastName;
    @Enumerated(EnumType.STRING)
    private IdType idType;
    @Column(length = 15)
    private String idNumber;
    @Enumerated(EnumType.STRING)
    private School school;
    private int shirtNumber;

    private String studentCertificateKey, medicalCertificateKey;
}
