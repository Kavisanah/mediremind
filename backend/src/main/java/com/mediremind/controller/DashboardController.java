package com.mediremind.controller;

import com.mediremind.dto.response.ApiResponse;
import com.mediremind.dto.response.DashboardResponse;
import com.mediremind.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse response = dashboardService.getDashboard();
        return ResponseEntity
                .ok(ApiResponse.success("Dashboard retrieved successfully", response));
    }
}