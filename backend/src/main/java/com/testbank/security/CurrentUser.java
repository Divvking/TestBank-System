package com.testbank.security;

import java.lang.annotation.*;

/**
 * Convenience annotation to inject the authenticated user ID from the JWT
 * into controller method parameters via CurrentUserArgumentResolver.
 *
 * Usage:
 *   public ResponseEntity<?> myEndpoint(@CurrentUser Integer userId) { ... }
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {}
