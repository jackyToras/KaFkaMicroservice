package com.utkarshhh.service.Impl;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.utkarshhh.domain.PaymentOrderStatus;
import com.utkarshhh.dto.BookingDTO;
import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.model.PaymentOrder;
import com.utkarshhh.payload.response.PaymentLinkResponse;
import com.utkarshhh.repository.PaymentOrderRepository;
import com.utkarshhh.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Override
    public PaymentLinkResponse createOrder(UserDTO user, BookingDTO booking) throws Exception {
        Long amount = (long) booking.getTotalPrice();

        PaymentOrder order = new PaymentOrder();
        order.setAmount(amount);
        order.setBookingId(booking.getId());
        order.setSalonId(booking.getSalonId());
        order.setUserId(booking.getCustomerId());

        PaymentOrder savedOrder = paymentOrderRepository.save(order);

        String paymentUrl = createStripePaymentLink(user, savedOrder.getAmount(), savedOrder.getId());

        savedOrder.setPaymentLinkId(savedOrder.getId().toHexString());
        paymentOrderRepository.save(savedOrder);

        PaymentLinkResponse response = new PaymentLinkResponse();
        response.setPayment_link_url(paymentUrl);
        response.setPayment_link_id(savedOrder.getId().toHexString());

        return response;
    }

    @Override
    public PaymentOrder getPaymentOrderById(ObjectId id) throws Exception {
        PaymentOrder paymentOrder = paymentOrderRepository.findById(id).orElse(null);
        if (paymentOrder == null) {
            throw new Exception("Payment order not found");
        }
        return paymentOrder;
    }

    @Override
    public PaymentOrder getPaymentOrderByPaymentId(String paymentId) throws Exception {
        PaymentOrder paymentOrder = paymentOrderRepository.findByPaymentLinkId(paymentId);
        if (paymentOrder == null) {
            throw new Exception("Payment order not found with payment link id: " + paymentId);
        }
        return paymentOrder;
    }

    @Override
    public Boolean proceedPayment(String paymentId, String paymentLinkId) throws Exception {
        PaymentOrder paymentOrder = paymentOrderRepository.findByPaymentLinkId(paymentLinkId);

        if (paymentOrder == null) {
            throw new Exception("Payment order not found");
        }

        paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
        paymentOrderRepository.save(paymentOrder);

        return true;
    }

    private String createStripePaymentLink(UserDTO user, Long amount, ObjectId orderId) throws Exception {
        try {
            Stripe.apiKey = stripeSecretKey;

            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:3000/payment/success?order_id=" + orderId.toHexString())
                    .setCancelUrl("http://localhost:3000/payment/cancel")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(amount * 100)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Salon Booking Payment")
                                            .build())
                                    .build())
                            .build())
                    .build();

            Session session = Session.create(params);
            return session.getUrl();
        } catch (Exception e) {
            throw new Exception("Error creating Stripe payment link: " + e.getMessage());
        }
    }
}