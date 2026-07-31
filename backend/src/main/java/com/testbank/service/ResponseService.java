package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final AttemptRepository  attemptRepository;
    private final QuestionRepository questionRepository;

    /**
     * Saves or updates the student's selected option for a question.
     *
     * Grading (is_correct, marks_awarded) is handled entirely by the
     * database trigger trg_auto_grade_response, which fires BEFORE INSERT
     * OR UPDATE on the response table. Java does not need to compute or
     * set those fields — the trigger sets them automatically based on
     * question.correct_option and test_question.marks.
     */
    @Transactional
    public ResponseDTO saveOrUpdate(Integer attemptId, ResponseRequest req, Integer userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (!attempt.getUser().getUserId().equals(userId))
            throw new BadRequestException("Unauthorized");
        if (!"IN_PROGRESS".equals(attempt.getStatus()))
            throw new BadRequestException("Attempt is not in progress");

        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Upsert — trigger handles is_correct and marks_awarded
        Response response = responseRepository
                .findByAttemptIdAndQuestionId(attemptId, req.getQuestionId())
                .orElse(Response.builder().attempt(attempt).question(question).build());

        response.setSelectedOption(req.getSelectedOption());
        response = responseRepository.save(response);

        // Re-fetch so the trigger-set fields are visible to the caller
        response = responseRepository.findByAttemptIdAndQuestionId(attemptId, req.getQuestionId())
                .orElse(response);

        return toDTO(response);
    }

    public List<ResponseDTO> getByAttempt(Integer attemptId) {
        return responseRepository.findWithQuestionByAttemptId(attemptId)
                .stream().map(this::toDTO).toList();
    }

    private ResponseDTO toDTO(Response r) {
        return ResponseDTO.builder()
                .responseId(r.getResponseId())
                .questionId(r.getQuestion().getQuestionId())
                .questionText(r.getQuestion().getQuestionText())
                .selectedOption(r.getSelectedOption())
                .correctOption(r.getQuestion().getCorrectOption())
                .isCorrect(r.getIsCorrect())
                .marksAwarded(r.getMarksAwarded())
                .build();
    }
}
