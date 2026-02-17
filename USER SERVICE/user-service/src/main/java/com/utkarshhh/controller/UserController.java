package com.utkarshhh.controller;

import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.modal.User;
import com.utkarshhh.repository.UserRepository;
import com.utkarshhh.service.UserSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserSyncService userSyncService;

    // EXPLICIT PATH - This must come first
    // Change /me to /current
    @GetMapping(value = "/current")
    public ResponseEntity<UserDTO> getCurrentUser() {
        try {
            System.out.println("/current endpoint called");
            User user = userSyncService.syncUserFromKeycloak();
            return ResponseEntity.ok(convertToDTO(user));
        } catch (Exception e) {
            System.err.println("Error in /current endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        try {
            System.out.println("/{id} endpoint called with id: " + id);
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDTO userDTO = convertToDTO(user);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        try {
            User user = convertToEntity(userDTO);
            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        try {
            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (userDTO.getFullName() != null) existingUser.setFullName(userDTO.getFullName());
            if (userDTO.getEmail() != null) existingUser.setEmail(userDTO.getEmail());
            if (userDTO.getPhone() != null) existingUser.setPhone(userDTO.getPhone());
            if (userDTO.getRole() != null) existingUser.setRole(userDTO.getRole());

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(convertToDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        return dto;
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        if (dto.getId() != null) {
            user.setId(dto.getId());
        }
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        return user;
    }
}