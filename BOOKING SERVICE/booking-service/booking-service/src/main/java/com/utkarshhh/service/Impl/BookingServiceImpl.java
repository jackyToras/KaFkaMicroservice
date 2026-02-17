package com.utkarshhh.service.Impl;

import com.utkarshhh.client.SalonClient;
import com.utkarshhh.client.ServiceClient;
import com.utkarshhh.client.UserClient;
import com.utkarshhh.domain.BookingStatus;
import com.utkarshhh.domain.PaymentStatus;
import com.utkarshhh.dto.BookingDTO;
import com.utkarshhh.dto.SalonDTO;
import com.utkarshhh.dto.ServiceDTO;
import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.model.Booking;
import com.utkarshhh.model.SalonReport;
import com.utkarshhh.repository.BookingRepository;
import com.utkarshhh.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private SalonClient salonClient;

    @Autowired
    private ServiceClient serviceClient;

    @Override
    public Booking createBooking(Booking booking,
                                 UserDTO userDTO,
                                 SalonDTO salonDTO,
                                 Set<ServiceDTO> serviceDTOSet) throws Exception {

        int totalDuration = serviceDTOSet.stream()
                .mapToInt(ServiceDTO::getDuration)
                .sum();

        LocalDateTime bookingStartTime = booking.getStartTime();
        LocalDateTime bookingEndTime = bookingStartTime.plusMinutes(totalDuration);

        Boolean isSlotAvailable = isTimeSlotAvailable(salonDTO, bookingStartTime, bookingEndTime);

        int totalPrice = serviceDTOSet.stream()
                .mapToInt(ServiceDTO::getPrice)
                .sum();

        Set<String> idList = serviceDTOSet.stream()
                .map(ServiceDTO::getId)
                .collect(Collectors.toSet());

        booking.setSalonId(salonDTO.getId());
        booking.setServiceIds(idList);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(booking.getPaymentStatus() != null ?
                booking.getPaymentStatus() : PaymentStatus.PENDING);
        booking.setStartTime(bookingStartTime);
        booking.setEndTime(bookingEndTime);
        booking.setTotalPrice(totalPrice);
        booking.setCustomerId(userDTO.getId());
        booking.setCustomerName(userDTO.getFullName());  // or getName() depending on your UserDTO
        booking.setCustomerEmail(userDTO.getEmail());

        return bookingRepository.save(booking);
    }

    @Override
    public Booking updateBooking(String bookingId, BookingStatus status) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found with id: " + bookingId));

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
    public Boolean isTimeSlotAvailable(SalonDTO salonDTO,
                                       LocalDateTime bookingStartTime,
                                       LocalDateTime bookingEndTime) throws Exception {
        List<Booking> existingBookings = getBookingBySalon(salonDTO.getId());

        LocalTime salonOpenTimeOnly = salonDTO.getOpenTime();
        LocalTime salonCloseTimeOnly = salonDTO.getCloseTime();

        LocalDateTime salonOpenTime = LocalDateTime.of(bookingStartTime.toLocalDate(), salonOpenTimeOnly);
        LocalDateTime salonCloseTime = LocalDateTime.of(bookingStartTime.toLocalDate(), salonCloseTimeOnly);

        if (salonCloseTimeOnly.isBefore(salonOpenTimeOnly)) {
            salonCloseTime = salonCloseTime.plusDays(1);
        }

        if (bookingStartTime.isBefore(salonOpenTime) || bookingEndTime.isAfter(salonCloseTime)) {
            throw new Exception("Booking time must be within salon's working hours: "
                    + salonOpenTimeOnly + " - " + salonCloseTimeOnly);
        }

        for (Booking existingBooking : existingBookings) {
            if (existingBooking.getStatus() == BookingStatus.CANCELLED) {
                continue;
            }

            LocalDateTime existingBookingStartTime = existingBooking.getStartTime();
            LocalDateTime existingBookingEndTime = existingBooking.getEndTime();

            if (bookingStartTime.isBefore(existingBookingEndTime) && bookingEndTime.isAfter(existingBookingStartTime)) {
                throw new Exception("Slot not available. Please choose a different time.");
            }

            if (bookingStartTime.isEqual(existingBookingStartTime) || bookingEndTime.isEqual(existingBookingEndTime)) {
                throw new Exception("Slot not available. Please choose a different time.");
            }
        }

        return true;
    }

    @Override
    public List<Booking> getBookingsByCustomer(String customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Booking> getBookingBySalon(String salonId) {  // ✅ Changed to String
        return bookingRepository.findBySalonId(salonId);
    }

    @Override
    public Booking getBookingById(String id) throws Exception {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            throw new Exception("Booking not found");
        }
        return booking;
    }

    @Override
    public BookingDTO updateBookingStatus(String bookingId, BookingStatus bookingStatus) {
        try {
            Booking booking = bookingRepository.findById(String.valueOf(new ObjectId(bookingId)))
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            booking.setStatus(bookingStatus);
            Booking updated = bookingRepository.save(booking);

            // Create DTO manually here
            BookingDTO dto = new BookingDTO();
            dto.setId(updated.getId().toString());
            dto.setSalonId(updated.getSalonId());
            dto.setCustomerId(updated.getCustomerId());
            dto.setCustomerName(updated.getCustomerName());
            dto.setCustomerEmail(updated.getCustomerEmail());
            dto.setServiceIds(updated.getServiceIds());
            dto.setStartTime(updated.getStartTime());
            dto.setEndTime(updated.getEndTime());
            dto.setStatus(updated.getStatus());
            dto.setPaymentStatus(updated.getPaymentStatus());
            dto.setPaymentMethod(updated.getPaymentMethod());
            dto.setTotalPrice(updated.getTotalPrice());

            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update booking status: " + e.getMessage());
        }
    }

    @Override
    public List<Booking> getBookingByDate(LocalDateTime date, String salonId) {
        List<Booking> allBooking = getBookingBySalon(salonId);

        if (date == null) {
            return allBooking;
        }

        return allBooking.stream()
                .filter(booking -> isSameDate(booking.getStartTime(), date) ||
                        isSameDate(booking.getEndTime(), date))
                .collect(Collectors.toList());
    }

    private boolean isSameDate(LocalDateTime dateTime, LocalDateTime date) {
        return dateTime.toLocalDate().isEqual(date.toLocalDate());
    }

    @Override
    public SalonReport getSalonReport(String salonId) {
        List<Booking> bookings = getBookingBySalon(salonId);

        int totalEarnings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRM)
                .mapToInt(Booking::getTotalPrice)
                .sum();

        Integer totalBooking = bookings.size();

        List<Booking> cancelledBookings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CANCELLED)
                .collect(Collectors.toList());

        int totalRefund = cancelledBookings.stream()
                .mapToInt(Booking::getTotalPrice)
                .sum();

        SalonReport report = new SalonReport();
        report.setSalonId(salonId);
        report.setCancelledBooking(cancelledBookings.size());
        report.setTotalBooking(totalBooking);
        report.setTotalEarnings(totalEarnings);
        report.setTotalRefund(totalRefund);

        return report;
    }
}