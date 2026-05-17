package dev.santiescobares.ubesweb.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"createdBy"})
    Optional<Post> findTopByOrderByCreatedAtDesc();

    @Query("""
            SELECT p FROM Post p
            WHERE (:id IS NULL AND cast(:slug as text) IS NULL)
               OR (:id IS NOT NULL AND p.id = :id)
               OR (cast(:slug as text) IS NOT NULL AND LOWER(p.slug) LIKE CONCAT('%', cast(:slug as text), '%'))
            """)
    Page<Post> findAllByFilters(@Param("id") Long id,
                                @Param("slug") String slug,
                                Pageable pageable);
}
