package dev.santiescobares.ubesweb.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    @Query(value = "SELECT * FROM users WHERE google_id ILIKE :googleId", nativeQuery = true)
    Optional<User> findByGoogleIdIncludingDeleted(@Param("googleId") String googleId);

    Optional<User> findByGoogleId(String googleId);
}
