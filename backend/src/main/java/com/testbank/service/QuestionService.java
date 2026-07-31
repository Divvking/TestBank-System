package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository     userRepository;

    @Transactional(readOnly = true)
    public Page<QuestionDTO> getAll(Integer categoryId, String difficulty, Pageable pageable) {
        return questionRepository.findFiltered(categoryId, difficulty, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public QuestionDTO getById(Integer id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public QuestionDTO create(QuestionRequest req, Integer creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Category category = resolveCategory(req.getCategoryId());

        Question q = Question.builder()
                .questionText(req.getQuestionText())
                .optionA(req.getOptionA()).optionB(req.getOptionB())
                .optionC(req.getOptionC()).optionD(req.getOptionD())
                .correctOption(req.getCorrectOption())
                .difficulty(req.getDifficulty())
                .defaultMarks(req.getDefaultMarks())
                .category(category)
                .createdBy(creator)
                .build();
        return toDTO(questionRepository.save(q));
    }

    @Transactional
    public QuestionDTO update(Integer id, QuestionRequest req, Integer requestingUserId) {
        Question q = findOrThrow(id);
        enforceOwnership(q.getCreatedBy().getUserId(), requestingUserId, "question");

        q.setQuestionText(req.getQuestionText());
        q.setOptionA(req.getOptionA()); q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC()); q.setOptionD(req.getOptionD());
        q.setCorrectOption(req.getCorrectOption());
        q.setDifficulty(req.getDifficulty());
        q.setDefaultMarks(req.getDefaultMarks());
        q.setCategory(resolveCategory(req.getCategoryId()));
        return toDTO(questionRepository.save(q));
    }

    @Transactional
    public void delete(Integer id, Integer requestingUserId) {
        Question q = findOrThrow(id);
        enforceOwnership(q.getCreatedBy().getUserId(), requestingUserId, "question");
        questionRepository.deleteById(id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Category resolveCategory(Integer categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private Question findOrThrow(Integer id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + id));
    }

    /**
     * ADMIN can touch anything; FACULTY can only touch resources they created.
     */
    private void enforceOwnership(Integer ownerId, Integer requestingUserId, String resource) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null &&
                auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        if (!isAdmin && !ownerId.equals(requestingUserId))
            throw new BadRequestException("You can only modify your own " + resource);
    }

    public QuestionDTO toDTO(Question q) {
        return QuestionDTO.builder()
                .questionId(q.getQuestionId())
                .questionText(q.getQuestionText())
                .optionA(q.getOptionA()).optionB(q.getOptionB())
                .optionC(q.getOptionC()).optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .difficulty(q.getDifficulty())
                .defaultMarks(q.getDefaultMarks())
                .categoryId(q.getCategory() != null ? q.getCategory().getCategoryId() : null)
                .categoryName(q.getCategory() != null ? q.getCategory().getCategoryName() : null)
                .createdBy(q.getCreatedBy() != null ? q.getCreatedBy().getName() : null)
                .build();
    }
}
