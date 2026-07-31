package com.testbank.repository;

import com.testbank.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, TestQuestion.TestQuestionId> {

    @Modifying
    @Query("DELETE FROM TestQuestion tq WHERE tq.test.testId = :testId")
    void deleteByTestId(@Param("testId") Integer testId);
}
