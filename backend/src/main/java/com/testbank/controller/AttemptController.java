package com.testbank.controller;

import com.testbank.dto.AttemptDTO;
import com.testbank.security.CurrentUser;
import com.testbank.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/start/{testId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttemptDTO> start(@PathVariable Integer testId,
                                             @CurrentUser Integer userId) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(attemptService.startAttempt(testId, userId));
    }

    @PostMapping("/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttemptDTO> submit(@PathVariable Integer attemptId,
                                              @RequestParam(defaultValue = "manual") String type,
                                              @CurrentUser Integer userId) {
        return ResponseEntity.ok(attemptService.submitAttempt(attemptId, userId, type));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AttemptDTO>> myAttempts(@CurrentUser Integer userId) {
        return ResponseEntity.ok(attemptService.getMyAttempts(userId));
    }

    /**
     * Ownership-enforced: a student can only fetch their own attempt.
     * Admin/Faculty can fetch any attempt (for test management).
     */
    @GetMapping("/{attemptId}")
    public ResponseEntity<AttemptDTO> getById(@PathVariable Integer attemptId,
                                               @CurrentUser Integer userId) {
        return ResponseEntity.ok(attemptService.getByIdForUser(attemptId, userId));
    }

    @GetMapping("/test/{testId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<List<AttemptDTO>> byTest(@PathVariable Integer testId) {
        return ResponseEntity.ok(attemptService.getByTest(testId));
    }
}
