package com.utkarshhh.dto;

import lombok.Data;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class BookingDTO {
    private ObjectId id;
    private ObjectId salonId;
    private ObjectId customerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Set<ObjectId> serviceIds;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private int totalPrice;
}
