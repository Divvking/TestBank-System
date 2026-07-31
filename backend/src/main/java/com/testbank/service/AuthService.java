package com.testbank.service;

import com.testbank.dto.*;
import com.testbank.entity.*;
import com.testbank.exception.*;
import com.testbank.repository.*;
import com.testbank.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BadRequestException("Email already registered");

        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getRoleName(), user.getUserId());
        return AuthResponse.builder()
                .token(token).name(user.getName())
                .email(user.getEmail()).role(role.getRoleName())
                .userId(user.getUserId()).build();
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(),
                user.getRole().getRoleName(), user.getUserId());
        return AuthResponse.builder()
                .token(token).name(user.getName())
                .email(user.getEmail()).role(user.getRole().getRoleName())
                .userId(user.getUserId()).build();
    }
}
