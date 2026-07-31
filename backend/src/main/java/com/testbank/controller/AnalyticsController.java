package com.testbank.controller;

import com.testbank.dto.*;
import com.testbank.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<DashboardStats> dashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/question-performance")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<List<QuestionPerformanceDTO>> questionPerformance() {
        return ResponseEntity.ok(analyticsService.getQuestionPerformance());
    }
}
