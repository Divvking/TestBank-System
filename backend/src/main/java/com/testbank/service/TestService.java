package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestRepository         testRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final QuestionRepository     questionRepository;
    private final UserRepository         userRepository;

    public List<TestDTO> getAll() {
        return testRepository.findAllWithQuestions().stream().map(this::toDTO).toList();
    }

    public List<TestDTO> getByCreator(Integer userId) {
        return testRepository.findByCreatedByUserId(userId).stream().map(this::toDTO).toList();
    }

    public TestDTO getById(Integer id) {
        return toDTO(testRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + id)));
    }

    @Transactional
    public TestDTO create(TestRequest req, Integer creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateTimeWindow(req.getStartTime(), req.getEndTime());

        Test test = Test.builder()
                .testName(req.getTestName())
                .duration(req.getDuration())
                .isRandomized(Boolean.TRUE.equals(req.getIsRandomized()))
                .totalMarks(BigDecimal.ZERO)
                .createdBy(creator)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();

        test = testRepository.save(test);

        BigDecimal total = assignQuestions(test, req.getQuestions());
        test.setTotalMarks(total);
        testRepository.save(test);

        return toDTO(testRepository.findByIdWithQuestions(test.getTestId()).orElseThrow());
    }

    @Transactional
    public TestDTO update(Integer id, TestRequest req, Integer requestingUserId) {
        Test test = testRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + id));

        enforceOwnership(test.getCreatedBy().getUserId(), requestingUserId, "test");

        validateTimeWindow(req.getStartTime(), req.getEndTime());

        test.setTestName(req.getTestName());
        test.setDuration(req.getDuration());
        test.setIsRandomized(Boolean.TRUE.equals(req.getIsRandomized()));
        test.setStartTime(req.getStartTime());
        test.setEndTime(req.getEndTime());

        testQuestionRepository.deleteByTestId(id);
        test.getTestQuestions().clear();

        BigDecimal total = assignQuestions(test, req.getQuestions());
        test.setTotalMarks(total);
        testRepository.save(test);

        return toDTO(testRepository.findByIdWithQuestions(id).orElseThrow());
    }

    @Transactional
    public void delete(Integer id, Integer requestingUserId) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));
        enforceOwnership(test.getCreatedBy().getUserId(), requestingUserId, "test");
        testRepository.deleteById(id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("End time cannot be before start time");
        }
    }

    private BigDecimal assignQuestions(Test test, List<TestQuestionItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        if (items == null || items.isEmpty()) return total;

        for (TestQuestionItem item : items) {
            Question q = questionRepository.findById(item.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Question not found: " + item.getQuestionId()));

            TestQuestion tq = TestQuestion.builder()
                    .test(test)
                    .question(q)
                    .marks(item.getMarks())
                    .sequenceOrder(item.getSequenceOrder())
                    .build();

            testQuestionRepository.save(tq);
            total = total.add(item.getMarks());
        }
        return total;
    }

    private void enforceOwnership(Integer ownerId, Integer requestingUserId, String resource) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = auth != null &&
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isAdmin && !ownerId.equals(requestingUserId)) {
            throw new BadRequestException("You can only modify your own " + resource);
        }
    }

    public TestDTO toDTO(Test t) {
        List<TestQuestionDTO> qDTOs = t.getTestQuestions() == null ? List.of() :
                t.getTestQuestions().stream().map(tq -> TestQuestionDTO.builder()
                                                        .questionId(tq.getQuestion().getQuestionId())
                                                        .questionText(tq.getQuestion().getQuestionText())
                                                        .optionA(tq.getQuestion().getOptionA())
                                                        .optionB(tq.getQuestion().getOptionB())
                                                        .optionC(tq.getQuestion().getOptionC())
                                                        .optionD(tq.getQuestion().getOptionD())
                                                        .difficulty(tq.getQuestion().getDifficulty())
                                                        .marks(tq.getMarks())
                                                        .sequenceOrder(tq.getSequenceOrder())
                                                        .build()).toList();

        List<TestQuestionDTO> display = qDTOs;

        return TestDTO.builder()
                .testId(t.getTestId())
                .testName(t.getTestName())
                .duration(t.getDuration())
                .totalMarks(t.getTotalMarks())
                .isRandomized(t.getIsRandomized())
                .createdBy(t.getCreatedBy() != null ? t.getCreatedBy().getName() : null)
                .createdAt(t.getCreatedAt())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .questionCount(display.size())
                .questions(display)
                .build();
    }
}