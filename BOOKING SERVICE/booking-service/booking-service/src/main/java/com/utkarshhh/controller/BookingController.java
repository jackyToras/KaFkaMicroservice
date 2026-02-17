package com.utkarshhh.controller;
import com.utkarshhh.client.SalonClient;
import com.utkarshhh.client.ServiceClient;
import com.utkarshhh.client.UserClient;
import com.utkarshhh.domain.BookingStatus;
import com.utkarshhh.domain.PaymentStatus;
import com.utkarshhh.dto.BookingDTO;
import com.utkarshhh.dto.BookingRequest;
import com.utkarshhh.dto.SalonDTO;
import com.utkarshhh.dto.ServiceDTO;
import com.utkarshhh.dto.UserDTO;
import com.utkarshhh.dto.BookingNotificationDTO;
import com.utkarshhh.mapper.BookingMapper;
import com.utkarshhh.service.NotificationPublisher;
import com.utkarshhh.model.Booking;
import com.utkarshhh.model.SalonReport;
import com.utkarshhh.repository.BookingRepository;
import com.utkarshhh.service.BookingService;
import com.utkarshhh.service.SalonService;
import com.utkarshhh.service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final SalonService salonService;
    private final ServiceOfferingService serviceOfferingService;
    private final BookingRepository bookingRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private SalonClient salonClient;

    @Autowired
    private ServiceClient serviceClient;

    @Autowired
    private NotificationPublisher notificationPublisher;

    @PostMapping("/admin/migrate-all-bookings")
    public ResponseEntity<?> migrateAllBookings() {
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            int fixed = 0;

            for (Booking booking : allBookings) {
                if (booking.getCustomerName() == null || booking.getCustomerEmail() == null) {
                    try {
                        UserDTO user = userClient.getUser(booking.getCustomerId());
                        booking.setCustomerName(user.getFullName());
                        booking.setCustomerEmail(user.getEmail());
                        bookingRepository.save(booking);
                        fixed++;
                    } catch (Exception e) {
                        System.err.println("Failed to fix booking: " + booking.getId());
                    }
                }
            }

            return ResponseEntity.ok("Fixed " + fixed + " bookings");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId) {
        try {

            Booking booking = bookingService.getBookingById(bookingId);


            if (booking.getStatus() == BookingStatus.CANCELLED) {
                return ResponseEntity.badRequest().body("Booking is already cancelled");
            }

            if (booking.getStatus() == BookingStatus.COMPLETED) {
                return ResponseEntity.badRequest().body("Cannot cancel a completed booking");
            }


            Booking updated = bookingService.updateBooking(bookingId, BookingStatus.CANCELLED);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error cancelling booking: " + e.getMessage());
        }
    }
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest bookingRequest,
            @RequestHeader("User-Id") String userId,
            @RequestHeader("User-Name") String userName,
            @RequestHeader("User-Email") String userEmail) {

        try {
            System.out.println("   Creating booking with:");
            System.out.println("   User-Id: " + userId);
            System.out.println("   User-Name: " + userName);
            System.out.println("   User-Email: " + userEmail);

            UserDTO userDTO = new UserDTO();
            userDTO.setId(userId);
            userDTO.setFullName(userName);
            userDTO.setEmail(userEmail);

            SalonDTO salonDTO = salonService.getSalonById(bookingRequest.getSalonId());

            Set<ServiceDTO> serviceDTOSet = new HashSet<>();
            for (String serviceId : bookingRequest.getServiceIds()) {
                ServiceDTO serviceDTO = serviceOfferingService.getServiceById(serviceId);
                serviceDTOSet.add(serviceDTO);
            }

            Booking booking = new Booking();
            booking.setStartTime(bookingRequest.getStartTime());
            booking.setPaymentMethod(bookingRequest.getPaymentMethod());
            booking.setCustomerId(userId);
            booking.setCustomerName(userName);
            booking.setCustomerEmail(userEmail);

            Booking createdBooking = bookingService.createBooking(booking, userDTO, salonDTO, serviceDTOSet);

            try {
                String serviceNames = serviceDTOSet.stream()
                        .map(ServiceDTO::getName)
                        .collect(Collectors.joining(", "));

                BookingNotificationDTO notification = new BookingNotificationDTO(
                        createdBooking.getId().toString(),
                        userEmail,
                        userName,
                        salonDTO.getName(),
                        serviceNames,
                        createdBooking.getStartTime().toString(),
                        createdBooking.getTotalPrice()
                );

                notificationPublisher.sendBookingNotification(notification);
                System.out.println("Notification sent!");
            } catch (Exception e) {
                System.err.println("Notification failed: " + e.getMessage());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/customer")
    public ResponseEntity<?> getBookingsByCustomer(@RequestParam String customerId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByCustomer(customerId);

            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(BookingMapper::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(bookingDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/salon")
    public ResponseEntity<?> getBookingsBySalon(@RequestParam String salonId) {
        try {
            List<Booking> bookings = bookingService.getBookingBySalon(salonId);

            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(BookingMapper::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(bookingDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/report")
    public ResponseEntity<?> getSalonReport(@RequestParam String salonId) {
        try {
            SalonReport report = bookingService.getSalonReport(salonId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/slots/salon/{salonId}/date/{date}")
    public ResponseEntity<?> getBookingsByDate(
            @PathVariable String salonId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        try {
            List<Booking> bookings = bookingService.getBookingByDate(date,salonId);

            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(BookingMapper::toDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(bookingDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable String bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);

            return ResponseEntity.ok(BookingMapper.toDTO(booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String bookingId,
            @RequestParam BookingStatus status) {
        try {
            Booking updatedBooking = bookingService.updateBooking(bookingId, status);

            return ResponseEntity.ok(BookingMapper.toDTO(updatedBooking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/payment")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable String bookingId,
            @RequestParam PaymentStatus paymentStatus) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            booking.setPaymentStatus(paymentStatus);

            if (paymentStatus == PaymentStatus.PAID) {
                booking.setStatus(BookingStatus.CONFIRM);
            } else if (paymentStatus == PaymentStatus.FAILED) {
                booking.setStatus(BookingStatus.CANCELLED);
            }

            Booking updatedBooking = bookingRepository.save(booking);

            return ResponseEntity.ok(BookingMapper.toDTO(updatedBooking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/test-feign/user/{userId}")
    public ResponseEntity<?> testUserFeign(@PathVariable String userId) {
        try {
            UserDTO user = userClient.getUser(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error calling User Service: " + e.getMessage());
        }
    }

    @GetMapping("/test-feign/salon/{salonId}")
    public ResponseEntity<?> testSalonFeign(@PathVariable String salonId) {
        try {
            SalonDTO salon = salonClient.getSalon(salonId);
            return ResponseEntity.ok(salon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error calling Salon Service: " + e.getMessage());
        }
    }

    @GetMapping("/test-feign/service/{serviceId}")
    public ResponseEntity<?> testServiceFeign(@PathVariable String serviceId) {
        try {
            ServiceDTO service = serviceClient.getService(serviceId);
            return ResponseEntity.ok(service);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error calling Service Offering: " + e.getMessage());
        }
    }
}