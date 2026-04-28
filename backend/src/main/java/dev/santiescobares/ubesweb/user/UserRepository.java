package dev.santiescobares.ubesweb.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    @Query(value = "SELECT * FROM users WHERE google_id ILIKE :googleId", nativeQuery = true)
    Optional<User> findByGoogleIdIncludingDeleted(@Param("googleId") String googleId);

    Optional<User> findByGoogleId(String googleId);

    @Modifying
    @Query(value = "UPDATE users " +
            "SET first_name = NULL, last_name = NULL, email = NULL, google_id = NULL " +
            "WHERE deleted_at IS NOT NULL " +
            "AND deleted_at <= NOW() - INTERVAL '5 days' " +
            "AND email IS NOT NULL",
            nativeQuery = true
    )
    int anonymizeDeletedUsers();
}
