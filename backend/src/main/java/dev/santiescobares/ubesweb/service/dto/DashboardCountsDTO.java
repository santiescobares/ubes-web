package dev.santiescobares.ubesweb.service.dto;

public record DashboardCountsDTO(
        CountDeltaDTO users,
        CountDeltaDTO activePunishments,
        CountDeltaDTO suggestions
) {}
