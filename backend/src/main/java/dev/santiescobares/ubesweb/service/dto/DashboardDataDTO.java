package dev.santiescobares.ubesweb.service.dto;

import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;

import java.util.List;

public record DashboardDataDTO(
        DashboardCountsDTO counts,
        PostDTO lastPost,
        List<UpcomingItemDTO> upcomingItems,
        List<SuggestionDTO> latestSuggestions
) {}
