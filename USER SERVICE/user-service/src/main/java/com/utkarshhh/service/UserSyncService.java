package com.utkarshhh.service;

import com.utkarshhh.modal.User;
import com.utkarshhh.repository.UserRepository;
import com.utkarshhh.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public User syncUserFromKeycloak() {
        String keycloakId = jwtUtils.getKeycloakUserId();

        if (keycloakId == null) {
            throw new RuntimeException("Unable to extract Keycloak user ID from token");
        }

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUserFromKeycloak(keycloakId));
    }

    private User createUserFromKeycloak(String keycloakId) {

        User user = new User();
        user.setKeycloakId(keycloakId);
        user.setEmail(jwtUtils.getEmail());
        user.setFullName(jwtUtils.getFullName());
        user.setRole(jwtUtils.getRole());

        return userRepository.save(user);
    }
}