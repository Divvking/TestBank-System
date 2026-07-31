package com.testbank.controller;

import com.testbank.dto.UserDTO;
import com.testbank.entity.User;
import com.testbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive())) // hide deleted users
                .map(u -> UserDTO.builder()
                        .userId(u.getUserId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().getRoleName())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        if (user.getEmail().equals(currentEmail)) {
            return ResponseEntity.badRequest()
                    .body("You cannot delete your own account");
        }

        if ("ADMIN".equals(user.getRole().getRoleName())) {
            long adminCount = userRepository.countByRoleRoleName("ADMIN");
            if (adminCount <= 1) {
                return ResponseEntity.badRequest()
                        .body("Cannot delete the last admin");
            }
        }

        user.setIsActive(false);
        userRepository.save(user);

        return ResponseEntity.ok("User deactivated successfully");
    }
}