package dev.santiescobares.ubesweb.post.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.post.Post;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class PostEvent extends LoggableEvent<Post> {

    private final Post post;

    public PostEvent(UUID userId, Post post, Action action) {
        super(userId, ResourceType.USER, post.getId().toString(), action);
        this.post = post;
    }

    @Override
    public Post getEntity() { return post; }
}
