package dev.santiescobares.ubesweb.service;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.service.dto.DashboardDataDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(Global.BASE_URL + "/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'COMPETITION', 'PRESS', 'CANTEEN')")
    public ResponseEntity<DashboardDataDTO> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardData());
    }
}
