package com.utkarshhh.model;

import com.utkarshhh.domain.PaymentOrderStatus;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "payment")
public class PaymentOrder {
    @Id
    private ObjectId id;
    private Long amount;
    private PaymentOrderStatus status = PaymentOrderStatus.PENDING;
    private String paymentLinkId;
    private ObjectId userId;
    private ObjectId salonId;
    private ObjectId bookingId;
}