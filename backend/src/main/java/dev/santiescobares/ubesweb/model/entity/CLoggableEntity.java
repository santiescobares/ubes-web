package dev.santiescobares.ubesweb.model.entity;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@MappedSuperclass
@Getter
@Setter
public abstract class CLoggableEntity {

    @CreationTimestamp
    private Instant createdAt;
}
