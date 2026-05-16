package dev.santiescobares.ubesweb.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
        SELECT u FROM User u
        WHERE (cast(:id as uuid) IS NULL AND cast(:firstName as text) IS NULL AND cast(:lastName as text) IS NULL
               AND cast(:email as text) IS NULL AND cast(:googleId as text) IS NULL)
           OR (cast(:id as uuid) IS NOT NULL AND u.id = :id)
           OR (cast(:firstName as text) IS NOT NULL AND LOWER(u.firstName) LIKE CONCAT('%', cast(:firstName as text), '%'))
           OR (cast(:lastName as text) IS NOT NULL AND LOWER(u.lastName) LIKE CONCAT('%', cast(:lastName as text), '%'))
           OR (cast(:email as text) IS NOT NULL AND LOWER(u.email) LIKE CONCAT('%', cast(:email as text), '%'))
           OR (cast(:googleId as text) IS NOT NULL AND LOWER(u.googleId) LIKE CONCAT('%', cast(:googleId as text), '%'))
    """)
    Page<User> findAllByFilters(@Param("id") UUID id,
                                @Param("firstName") String firstName,
                                @Param("lastName") String lastName,
                                @Param("email") String email,
                                @Param("googleId") String googleId,
                                Pageable pageable);

    @Modifying
    @Query(value = """
            UPDATE users
            SET first_name = NULL, last_name = NULL, email = NULL,
                google_id = NULL, picture_key = NULL
            WHERE deleted_at IS NOT NULL
            AND deleted_at <= NOW() - INTERVAL '5 days'
            AND email IS NOT NULL
            """, nativeQuery = true)
    int anonymizeDeletedUsers();
}
