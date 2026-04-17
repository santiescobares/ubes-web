package dev.santiescobares.ubesweb.user;

import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.enums.School;
import dev.santiescobares.ubesweb.model.entity.CUDLoggableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_emails", columnList = "email"),
        @Index(name = "idx_user_google_ids", columnList = "google_id")
})
@Getter
@Setter
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
public class User extends CUDLoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(length = 30)
    private String firstName, lastName;
    @Column(unique = true, length = 320)
    private String email;

    @Column(unique = true)
    private String googleId;

    @Enumerated(EnumType.STRING)
    private Role role;
    @Enumerated(EnumType.STRING)
    private School school;

    private String pictureKey;

    private boolean active;
}
