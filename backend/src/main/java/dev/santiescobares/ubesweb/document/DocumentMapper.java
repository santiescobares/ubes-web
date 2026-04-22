package dev.santiescobares.ubesweb.document;

import dev.santiescobares.ubesweb.document.dto.DocumentCreateDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentUpdateDTO;
import dev.santiescobares.ubesweb.model.GeneralMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {GeneralMapper.class}
)
public interface DocumentMapper {

    Document toEntity(DocumentCreateDTO dto);

    @Mapping(source = "key", target = "url", qualifiedByName = "r2KeyToR2URL")
    DocumentDTO toDTO(Document document);

    void updateFromDTO(@MappingTarget Document document, DocumentUpdateDTO dto);
}
