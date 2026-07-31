package com.testbank.repository;

import com.testbank.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<Attempt, Integer> {

    @Query("SELECT a FROM Attempt a JOIN FETCH a.test JOIN FETCH a.user WHERE a.user.userId = :userId")
    List<Attempt> findByUserUserId(@Param("userId") Integer userId);

    @Query("SELECT a FROM Attempt a JOIN FETCH a.user JOIN FETCH a.test WHERE a.test.testId = :testId")
    List<Attempt> findByTestTestId(@Param("testId") Integer testId);

    Optional<Attempt> findByUserUserIdAndTestTestIdAndStatus(
            Integer userId, Integer testId, String status);
}
