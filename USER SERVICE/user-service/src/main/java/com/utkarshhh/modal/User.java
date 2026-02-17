package com.utkarshhh.modal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String keycloakId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
}