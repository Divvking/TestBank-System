package com.testbank.controller;

import com.testbank.dto.*;
import com.testbank.security.CurrentUser;
import com.testbank.service.ResponseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
public class ResponseController {

    private final ResponseService responseService;

    @PostMapping("/attempt/{attemptId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseDTO> saveResponse(@PathVariable Integer attemptId,
                                                     @Valid @RequestBody ResponseRequest req,
                                                     @CurrentUser Integer userId) {
        return ResponseEntity.ok(responseService.saveOrUpdate(attemptId, req, userId));
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<ResponseDTO>> getByAttempt(@PathVariable Integer attemptId) {
        return ResponseEntity.ok(responseService.getByAttempt(attemptId));
    }
}
