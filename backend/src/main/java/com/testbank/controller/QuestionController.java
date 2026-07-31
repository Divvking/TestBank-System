package com.testbank.controller;

import com.testbank.dto.*;
import com.testbank.security.CurrentUser;
import com.testbank.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<Page<QuestionDTO>> getAll(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String difficulty,
            @PageableDefault(size = 50, sort = "questionId") Pageable pageable) {
        return ResponseEntity.ok(questionService.getAll(categoryId, difficulty, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<QuestionDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(questionService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<QuestionDTO> create(@Valid @RequestBody QuestionRequest req,
                                               @CurrentUser Integer userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.create(req, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<QuestionDTO> update(@PathVariable Integer id,
                                               @Valid @RequestBody QuestionRequest req,
                                               @CurrentUser Integer userId) {
        return ResponseEntity.ok(questionService.update(id, req, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<Void> delete(@PathVariable Integer id,
                                        @CurrentUser Integer userId) {
        questionService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
