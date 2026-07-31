package com.testbank.controller;

import com.testbank.dto.*;
import com.testbank.security.CurrentUser;
import com.testbank.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @PostMapping("/compute/{attemptId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResultDTO> compute(@PathVariable Integer attemptId,
                                              @CurrentUser Integer userId) {
        return ResponseEntity.ok(resultService.computeResult(attemptId, userId));
    }

    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResultDTO> getByAttempt(@PathVariable Integer attemptId,
                                                   @CurrentUser Integer userId) {
        return ResponseEntity.ok(resultService.getResult(attemptId, userId));
    }

    @GetMapping("/leaderboard/{testId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaderboardEntry>> leaderboard(@PathVariable Integer testId) {
        return ResponseEntity.ok(resultService.getLeaderboard(testId));
    }
}
