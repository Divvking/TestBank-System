package com.testbank.service;

import com.testbank.dto.CategoryDTO;
import com.testbank.entity.Category;
import com.testbank.exception.*;
import com.testbank.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDTO(c.getCategoryId(), c.getCategoryName()))
                .toList();
    }

    public CategoryDTO create(CategoryDTO dto) {
        if (categoryRepository.existsByCategoryName(dto.getCategoryName()))
            throw new BadRequestException("Category already exists");
        Category saved = categoryRepository.save(new Category(null, dto.getCategoryName()));
        return new CategoryDTO(saved.getCategoryId(), saved.getCategoryName());
    }

    public CategoryDTO update(Integer id, CategoryDTO dto) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cat.setCategoryName(dto.getCategoryName());
        categoryRepository.save(cat);
        return new CategoryDTO(cat.getCategoryId(), cat.getCategoryName());
    }

    public void delete(Integer id) {
        if (!categoryRepository.existsById(id))
            throw new ResourceNotFoundException("Category not found");
        categoryRepository.deleteById(id);
    }
}
