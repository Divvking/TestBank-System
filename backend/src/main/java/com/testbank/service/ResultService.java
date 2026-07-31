package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository   resultRepository;
    private final AttemptRepository  attemptRepository;
    private final ResponseRepository responseRepository;
    private final TestRepository     testRepository;
    private final EntityManager      entityManager;

    @Transactional
    public ResultDTO computeResult(Integer attemptId, Integer requestingUserId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        enforceAttemptAccess(attempt, requestingUserId);

        if ("IN_PROGRESS".equals(attempt.getStatus()))
            throw new BadRequestException("Submit the attempt before computing result");

        entityManager
                .createNativeQuery("SELECT calculate_result(:id)")
                .setParameter("id", attemptId)
                .getSingleResult();

        entityManager
                .createNativeQuery("SELECT compute_rank(:tid)")
                .setParameter("tid", attempt.getTest().getTestId())
                .getResultList();

        entityManager.clear();

        Result result = resultRepository.findByAttemptAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found after computation"));

        return buildResultDTO(result);
    }

    public ResultDTO getResult(Integer attemptId, Integer requestingUserId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        enforceAttemptAccess(attempt, requestingUserId);

        Result result = resultRepository.findByAttemptAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not computed yet"));
        return buildResultDTO(result);
    }

    public List<LeaderboardEntry> getLeaderboard(Integer testId) {
        if (!testRepository.existsById(testId))
            throw new ResourceNotFoundException("Test not found");

        return resultRepository.findByTestIdOrderByScore(testId).stream()
                .map(r -> {
                    Attempt a = r.getAttempt();
                    return LeaderboardEntry.builder()
                            .rank(r.getRankPosition())
                            .studentName(a.getUser().getName())
                            .email(a.getUser().getEmail())
                            .score(r.getScore())
                            .totalMarks(a.getTest().getTotalMarks())
                            .submittedAt(a.getEndTime())
                            .build();
                }).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /**
     * Students can only access their own attempt's result.
     * ADMIN and FACULTY can access any.
     */
    private void enforceAttemptAccess(Attempt attempt, Integer requestingUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPrivileged = auth != null && (
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")) ||
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_FACULTY")));
        if (!isPrivileged && !attempt.getUser().getUserId().equals(requestingUserId))
            throw new BadRequestException("Access denied");
    }

    private ResultDTO buildResultDTO(Result result) {
        Attempt attempt = result.getAttempt();
        List<Response> responses = responseRepository
                .findWithQuestionByAttemptId(attempt.getAttemptId());
        long correct = responses.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsCorrect())).count();

        List<ResponseDTO> rDTOs = responses.stream()
                .map(r -> ResponseDTO.builder()
                        .responseId(r.getResponseId())
                        .questionId(r.getQuestion().getQuestionId())
                        .questionText(r.getQuestion().getQuestionText())
                        .selectedOption(r.getSelectedOption())
                        .correctOption(r.getQuestion().getCorrectOption())
                        .isCorrect(r.getIsCorrect())
                        .marksAwarded(r.getMarksAwarded())
                        .build())
                .toList();

        return ResultDTO.builder()
                .resultId(result.getResultId())
                .attemptId(attempt.getAttemptId())
                .testId(attempt.getTest().getTestId())
                .testName(attempt.getTest().getTestName())
                .score(result.getScore())
                .totalMarks(attempt.getTest().getTotalMarks())
                .rankPosition(result.getRankPosition())
                .totalQuestions(responses.size())
                .correctAnswers(correct)
                .submittedAt(attempt.getEndTime())
                .responses(rDTOs)
                .build();
    }
}
