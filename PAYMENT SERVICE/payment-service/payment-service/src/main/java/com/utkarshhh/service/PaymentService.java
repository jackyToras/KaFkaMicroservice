package com.utkarshhh.service;

import com.utkarshhh.dto.BookingDTO;
import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.model.PaymentOrder;
import com.utkarshhh.payload.response.PaymentLinkResponse;
import org.bson.types.ObjectId;

public interface PaymentService {
    PaymentLinkResponse createOrder(UserDTO user, BookingDTO booking) throws Exception;
    PaymentOrder getPaymentOrderById(ObjectId id) throws Exception;
    PaymentOrder getPaymentOrderByPaymentId(String paymentId) throws Exception;
    Boolean proceedPayment(String paymentId, String paymentLinkId) throws Exception;
}