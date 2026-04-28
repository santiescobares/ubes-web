package dev.santiescobares.ubesweb.punishment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface PunishmentRepository extends JpaRepository<Punishment, Long> {

    @Query("""
        SELECT COUNT(p) > 0 FROM Punishment p
        WHERE p.issuedOn.id = :issuedOnId
        AND p.removedAt IS NULL
        AND (p.expiresAt IS NULL OR p.expiresAt > :now)
    """)
    boolean hasActivePunishments(
            @Param("issuedOnId") UUID issuedOnId,
            @Param("now") LocalDateTime now
    );

    @Query("""
        SELECT p FROM Punishment p
        WHERE (:id IS NULL OR p.id = :id)
        AND (cast(:issuedOnId as uuid) IS NULL OR p.issuedOn.id = :issuedOnId)
        AND (cast(:issuedById as uuid) IS NULL OR p.issuedBy.id = :issuedById)
    """)
    Page<Punishment> findPunishmentsByFilters(
            @Param("id") Long id,
            @Param("issuedOnId") UUID issuedOnId,
            @Param("issuedById") UUID issuedById,
            Pageable pageable
    );
}
