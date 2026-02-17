package com.utkarshhh.consumer;

import com.utkarshhh.config.RabbitMQConfig;
import com.utkarshhh.dto.BookingNotificationDTO;
import com.utkarshhh.dto.PaymentNotificationDTO;
import com.utkarshhh.handler.NotificationWebSocketHandler;
import com.utkarshhh.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private final EmailService emailService;

    @Autowired
    public NotificationConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
    public void handleBookingNotification(BookingNotificationDTO notification) {
        System.out.println(" Received BOOKING notification:");
        System.out.println("   Booking ID: " + notification.getBookingId());
        System.out.println("   Customer: " + notification.getCustomerName());
        System.out.println("   Email: " + notification.getCustomerEmail());

        try {
            // 1. Send Email
            emailService.sendBookingConfirmation(
                    notification.getCustomerEmail(),
                    notification.getCustomerName(),
                    notification.getSalonName(),
                    notification.getServiceName(),
                    notification.getStartTime(),
                    notification.getTotalPrice()
            );
            System.out.println(" Booking confirmation email sent!");

            // 2. Broadcast to WebSocket clients (REAL-TIME NOTIFICATION)
            NotificationWebSocketHandler.broadcastNotification(
                    "booking",
                    "Booking Confirmed! ",
                    "Your appointment at " + notification.getSalonName() + " has been confirmed for " + notification.getStartTime()
            );
            System.out.println(" WebSocket notification broadcasted!");

        } catch (Exception e) {
            System.err.println(" Failed to send booking notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void handlePaymentNotification(PaymentNotificationDTO notification) {
        System.out.println(" Received PAYMENT notification:");
        System.out.println("   Payment ID: " + notification.getPaymentId());
        System.out.println("   Customer: " + notification.getCustomerName());
        System.out.println("   Email: " + notification.getCustomerEmail());
        System.out.println("   Amount: ₹" + notification.getAmount());

        try {
            // 1. Send Email Receipt
            emailService.sendPaymentReceipt(
                    notification.getCustomerEmail(),
                    notification.getCustomerName(),
                    notification.getAmount(),
                    notification.getTransactionId()
            );
            System.out.println(" Payment receipt email sent!");

            // 2. Broadcast to WebSocket clients (REAL-TIME NOTIFICATION)
            NotificationWebSocketHandler.broadcastNotification(
                    "payment",
                    "Payment Successful! ",
                    "Your payment of ₹" + notification.getAmount() + " has been processed successfully. Transaction ID: " + notification.getTransactionId()
            );
            System.out.println(" WebSocket notification broadcasted!");

        } catch (Exception e) {
            System.err.println(" Failed to send payment notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}