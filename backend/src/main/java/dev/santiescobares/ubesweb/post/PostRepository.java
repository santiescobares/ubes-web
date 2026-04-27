package dev.santiescobares.ubesweb.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    boolean existsBySlug(String slug);

    Optional<Post> findBySlug(String slug);

    Optional<Post> findBySlugAndHiddenFalse(String slug);

    Page<Post> findAllByHiddenFalse(Pageable pageable);
}
