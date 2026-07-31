package com.testbank.repository;

import com.testbank.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Integer> {

    @Query("SELECT res FROM Result res " +
           "JOIN FETCH res.attempt a JOIN FETCH a.user JOIN FETCH a.test " +
           "WHERE a.attemptId = :attemptId")
    Optional<Result> findByAttemptAttemptId(@Param("attemptId") Integer attemptId);

    @Query("SELECT res FROM Result res " +
           "JOIN FETCH res.attempt a JOIN FETCH a.user JOIN FETCH a.test " +
           "WHERE a.test.testId = :testId ORDER BY res.score DESC")
    List<Result> findByTestIdOrderByScore(@Param("testId") Integer testId);

    @Query("SELECT AVG(res.score) FROM Result res")
    BigDecimal globalAverageScore();
}
