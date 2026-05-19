package dev.santiescobares.ubesweb.suggestion.dto;

import java.time.LocalDate;
import java.util.List;

public record SuggestionsByDateDTO(LocalDate date, List<SuggestionDTO> suggestions) {}
