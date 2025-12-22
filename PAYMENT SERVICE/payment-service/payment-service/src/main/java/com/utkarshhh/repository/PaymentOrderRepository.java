package com.utkarshhh.repository;

import com.utkarshhh.model.PaymentOrder;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentOrderRepository extends MongoRepository<PaymentOrder, ObjectId> {
    PaymentOrder findByPaymentLinkId(String paymentLinkId);
}
