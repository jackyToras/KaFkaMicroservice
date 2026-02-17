package com.utkarshhh.payload.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalonDTO {
    private String id;
    private String name;
    private List<String> images;
    private String address;
    private String phoneNumber;
    private String email;
    private String city;
    private Long ownerId;
    private LocalTime openTime;
    private LocalTime closeTime;
}