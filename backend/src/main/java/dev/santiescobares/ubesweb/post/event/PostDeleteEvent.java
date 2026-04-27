package dev.santiescobares.ubesweb.post.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.post.Post;

import java.util.UUID;

public class PostDeleteEvent extends PostEvent {

    public PostDeleteEvent(UUID userId, Post post) {
        super(userId, post, Action.DELETE);
    }
}
