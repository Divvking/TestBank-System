package com.testbank.repository;

import com.testbank.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

    /**
     * Paginated, filtered question list. Faculty/Admin use this for the question bank.
     * Avoiding fetch join here because Page + fetch join causes Hibernate to do
     * in-memory pagination (HHH90003004 warning). Count query is explicit and efficient.
     */
    @Query(value = "SELECT q FROM Question q LEFT JOIN q.category cat WHERE " +
                   "(:categoryId IS NULL OR (cat IS NOT NULL AND cat.categoryId = :categoryId)) AND " +
                   "(:difficulty IS NULL OR q.difficulty = :difficulty)",
           countQuery = "SELECT COUNT(q) FROM Question q LEFT JOIN q.category cat WHERE " +
                        "(:categoryId IS NULL OR (cat IS NOT NULL AND cat.categoryId = :categoryId)) AND " +
                        "(:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Question> findFiltered(@Param("categoryId") Integer categoryId,
                                @Param("difficulty") String difficulty,
                                Pageable pageable);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.category WHERE q.createdBy.userId = :uid")
    List<Question> findByCreatedByUserId(@Param("uid") Integer uid);
}
