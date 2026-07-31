package com.testbank.repository;

import com.testbank.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ResponseRepository extends JpaRepository<Response, Integer> {

    @Query("SELECT r FROM Response r JOIN FETCH r.question WHERE r.attempt.attemptId = :id")
    List<Response> findWithQuestionByAttemptId(@Param("id") Integer id);

    @Query("SELECT r FROM Response r " +
           "WHERE r.attempt.attemptId = :attemptId AND r.question.questionId = :questionId")
    Optional<Response> findByAttemptIdAndQuestionId(
            @Param("attemptId") Integer attemptId,
            @Param("questionId") Integer questionId);

    long countByAttemptAttemptIdAndIsCorrectTrue(Integer attemptId);
}
