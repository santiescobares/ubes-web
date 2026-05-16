package dev.santiescobares.ubesweb.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("""
        SELECT d FROM Document d
        WHERE (:id IS NULL OR d.id = :id)
        AND (cast(:name as text) IS NULL OR LOWER(d.name) LIKE CONCAT('%', cast(:name as text), '%'))
        ORDER BY d.createdAt ASC
    """)
    List<Document> findAllByFilters(@Param("id") Long id, @Param("name") String name);
}
