package dev.santiescobares.ubesweb.document;

import dev.santiescobares.ubesweb.document.enums.DocumentType;
import dev.santiescobares.ubesweb.enums.FileType;
import dev.santiescobares.ubesweb.model.loggable.CULoggableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
public class Document extends CULoggableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String name;
    @Enumerated(EnumType.STRING)
    private DocumentType type;
    @Enumerated(EnumType.STRING)
    private FileType fileType;
    private long size;

    private String key;
}
