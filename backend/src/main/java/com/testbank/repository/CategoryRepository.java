package com.testbank.repository;

import com.testbank.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByCategoryName(String categoryName);
}
