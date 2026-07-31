package com.testbank.controller;

import com.testbank.dto.*;
import com.testbank.security.CurrentUser;
import com.testbank.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @GetMapping
    public ResponseEntity<List<TestDTO>> getAll() {
        return ResponseEntity.ok(testService.getAll());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<List<TestDTO>> getMy(@CurrentUser Integer userId) {
        return ResponseEntity.ok(testService.getByCreator(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(testService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<TestDTO> create(@Valid @RequestBody TestRequest req,
                                           @CurrentUser Integer userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testService.create(req, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<TestDTO> update(@PathVariable Integer id,
                                           @Valid @RequestBody TestRequest req,
                                           @CurrentUser Integer userId) {
        return ResponseEntity.ok(testService.update(id, req, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<Void> delete(@PathVariable Integer id,
                                        @CurrentUser Integer userId) {
        testService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
