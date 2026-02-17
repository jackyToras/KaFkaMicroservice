package com.utkarshhh.dto;

import java.io.Serializable;

public class PaymentNotificationDTO implements Serializable {
    private String paymentId;
    private String bookingId;
    private String customerEmail;
    private String customerName;
    private Integer amount;
    private String paymentStatus;
    private String transactionId;


    public PaymentNotificationDTO() {
    }

    public PaymentNotificationDTO(String paymentId, String bookingId, String customerEmail,
                                 String customerName, Integer amount, String paymentStatus,
                                 String transactionId) {
        this.paymentId = paymentId;
        this.bookingId = bookingId;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}