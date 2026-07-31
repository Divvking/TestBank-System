package com.testbank.service;

import com.testbank.dto.AttemptDTO;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final TestRepository    testRepository;
    private final UserRepository    userRepository;

    @Transactional
    public AttemptDTO startAttempt(Integer testId, Integer userId) {

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        if (test.getStartTime() != null && now.isBefore(test.getStartTime())) {
            throw new BadRequestException("Test has not started yet");
        }

        if (test.getEndTime() != null && now.isAfter(test.getEndTime())) {
            throw new BadRequestException("Test has already ended");
        }

        return attemptRepository
                .findByUserUserIdAndTestTestIdAndStatus(userId, testId, "IN_PROGRESS")
                .map(this::toDTO)
                .orElseGet(() -> {
                    Attempt attempt = Attempt.builder()
                            .user(user).test(test)
                            .startTime(LocalDateTime.now())
                            .status("IN_PROGRESS")
                            .build();
                    return toDTO(attemptRepository.save(attempt));
                });
    }

    @Transactional
    public AttemptDTO submitAttempt(Integer attemptId, Integer userId, String type) {
        Attempt attempt = findOrThrow(attemptId);
        if (!attempt.getUser().getUserId().equals(userId))
            throw new BadRequestException("Unauthorized");
        if (!"IN_PROGRESS".equals(attempt.getStatus()))
            throw new BadRequestException("Attempt already submitted");

        attempt.setStatus("auto".equals(type) ? "AUTO_SUBMITTED" : "SUBMITTED");
        attempt.setEndTime(LocalDateTime.now());
        return toDTO(attemptRepository.save(attempt));
    }

    /**
     * Ownership-aware get: students can only see their own attempt;
     * ADMIN and FACULTY can see any attempt.
     */
    public AttemptDTO getByIdForUser(Integer attemptId, Integer requestingUserId) {
        Attempt attempt = findOrThrow(attemptId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPrivileged = auth != null && (
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")) ||
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_FACULTY")));
        if (!isPrivileged && !attempt.getUser().getUserId().equals(requestingUserId))
            throw new BadRequestException("Access denied");
        return toDTO(attempt);
    }

    public AttemptDTO getById(Integer attemptId) {
        return toDTO(findOrThrow(attemptId));
    }

    public List<AttemptDTO> getMyAttempts(Integer userId) {
        return attemptRepository.findByUserUserId(userId)
                .stream().map(this::toDTO).toList();
    }

    public List<AttemptDTO> getByTest(Integer testId) {
        return attemptRepository.findByTestTestId(testId)
                .stream().map(this::toDTO).toList();
    }

    private Attempt findOrThrow(Integer id) {
        return attemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + id));
    }

    private AttemptDTO toDTO(Attempt a) {
        return AttemptDTO.builder()
                .attemptId(a.getAttemptId())
                .testId(a.getTest().getTestId())
                .testName(a.getTest().getTestName())
                .duration(a.getTest().getDuration())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .build();
    }
}
