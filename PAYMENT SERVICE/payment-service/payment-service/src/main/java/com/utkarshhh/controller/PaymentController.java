package com.utkarshhh.controller;

import com.utkarshhh.dto.BookingDTO;
import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.model.PaymentOrder;
import com.utkarshhh.payload.response.PaymentLinkResponse;
import com.utkarshhh.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPaymentLink(
            @RequestBody BookingDTO booking,
            @RequestHeader("User-Id") String userId,
            @RequestHeader("User-Name") String userName,
            @RequestHeader("User-Email") String userEmail) {

        try {
            UserDTO user = new UserDTO();
            user.setFullName(userName);
            user.setEmail(userEmail);

            PaymentLinkResponse response = paymentService.createOrder(user, booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{paymentOrderId}")
    public ResponseEntity<?> getPaymentOrderById(@PathVariable String paymentOrderId) {
        try {
            PaymentOrder paymentOrder = paymentService.getPaymentOrderById(new ObjectId(paymentOrderId));
            return ResponseEntity.ok(paymentOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/proceed")
    public ResponseEntity<?> proceedPayment(
            @RequestParam String paymentId,
            @RequestParam String paymentLinkId) {

        try {
            Boolean result = paymentService.proceedPayment(paymentId, paymentLinkId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}