package dev.santiescobares.ubesweb.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    boolean existsBySlug(String slug);

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
