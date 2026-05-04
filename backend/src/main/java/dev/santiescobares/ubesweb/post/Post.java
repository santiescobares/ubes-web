package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.model.loggableentity.CULoggableEntity;
import dev.santiescobares.ubesweb.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_created_by_ids", columnList = "created_by_id")
})
@Getter
@Setter
public class Post extends CULoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(length = 100)
    private String title;
    @Column(unique = true)
    private String slug;
    @Column(length = 5000)
    private String body;

    private String bannerKey;

    @Override
    public String toString() {
        return "Post{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", slug='" + slug + '\'' +
                ", body='" + body + '\'' +
                ", bannerKey='" + bannerKey + '\'' +
                '}';
    }
}
