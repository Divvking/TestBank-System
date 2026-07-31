package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository     userRepository;
    private final TestRepository     testRepository;
    private final QuestionRepository questionRepository;
    private final AttemptRepository  attemptRepository;
    private final ResultRepository   resultRepository;
    private final EntityManager      entityManager;

    public DashboardStats getDashboardStats() {
        long tests     = testRepository.count();
        long questions = questionRepository.count();
        long students  = userRepository.countByRoleRoleName("STUDENT");
        long attempts  = attemptRepository.count();
        BigDecimal avg = resultRepository.globalAverageScore();
        return DashboardStats.builder()
                .totalTests(tests)
                .totalQuestions(questions)
                .totalStudents(students)
                .totalAttempts(attempts)
                .averageScore(avg != null ? avg : BigDecimal.ZERO)
                .build();
    }

    @SuppressWarnings("unchecked")
    public List<QuestionPerformanceDTO> getQuestionPerformance() {
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT question_id, question_text, category_name, difficulty, " +
                "total_attempts, correct_count, accuracy_pct " +
                "FROM question_performance_view")
                .getResultList();

        return rows.stream().map(r -> QuestionPerformanceDTO.builder()
                .questionId(r[0] != null ? ((Number) r[0]).intValue() : null)
                .questionText((String) r[1])
                .categoryName((String) r[2])
                .difficulty((String) r[3])
                .totalAttempts(r[4] != null ? ((Number) r[4]).longValue() : 0L)
                .correctCount(r[5] != null ? ((Number) r[5]).longValue() : 0L)
                .accuracyPct(r[6] != null ? new BigDecimal(r[6].toString()) : BigDecimal.ZERO)
                .build())
                .toList();
    }
}
