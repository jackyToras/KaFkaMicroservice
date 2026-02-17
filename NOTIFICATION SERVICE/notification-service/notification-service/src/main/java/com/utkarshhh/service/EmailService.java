package com.utkarshhh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("utkarsh1605shaning@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
        System.out.println("Email sent successfully to: " + to);
    }

    public void sendBookingConfirmation(String to, String customerName,
                                        String salonName, String serviceName,
                                        String startTime, Integer totalPrice) {
        String subject = "Booking Confirmation - " + salonName;
        String body = "Dear " + customerName + ",\n\n" +
                "Your booking has been confirmed!\n\n" +
                "Salon: " + salonName + "\n" +
                "Service: " + serviceName + "\n" +
                "Date & Time: " + startTime + "\n" +
                "Total Amount: ₹" + totalPrice + "\n\n" +
                "Thank you for choosing us!\n\n" +
                "Best regards,\n" +
                "Salon Booking Team";

        sendEmail(to, subject, body);
    }

    public void sendPaymentReceipt(String to, String customerName,
                                   Integer amount, String transactionId) {
        String subject = "Payment Successful - Receipt";
        String body = "Dear " + customerName + ",\n\n" +
                "Your payment has been processed successfully!\n\n" +
                "Amount Paid: ₹" + amount + "\n" +
                "Transaction ID: " + transactionId + "\n" +
                "Payment Status: SUCCESS\n\n" +
                "Thank you for your payment!\n\n" +
                "Best regards,\n" +
                "Salon Booking Team";

        sendEmail(to, subject, body);
    }
}