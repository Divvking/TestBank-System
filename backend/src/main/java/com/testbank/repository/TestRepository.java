package com.testbank.repository;

import com.testbank.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TestRepository extends JpaRepository<Test, Integer> {

    @Query("SELECT DISTINCT t FROM Test t " +
           "LEFT JOIN FETCH t.testQuestions tq LEFT JOIN FETCH tq.question " +
           "JOIN FETCH t.createdBy")
    List<Test> findAllWithQuestions();

    @Query("SELECT t FROM Test t " +
           "LEFT JOIN FETCH t.testQuestions tq LEFT JOIN FETCH tq.question " +
           "JOIN FETCH t.createdBy " +
           "WHERE t.testId = :id")
    Optional<Test> findByIdWithQuestions(@Param("id") Integer id);

    @Query("SELECT DISTINCT t FROM Test t " +
           "LEFT JOIN FETCH t.testQuestions tq LEFT JOIN FETCH tq.question " +
           "JOIN FETCH t.createdBy " +
           "WHERE t.createdBy.userId = :userId")
    List<Test> findByCreatedByUserId(@Param("userId") Integer userId);
}
