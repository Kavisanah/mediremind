package com.mediremind.controller;

import com.mediremind.dto.request.AppointmentRequest;
import com.mediremind.dto.response.ApiResponse;
import com.mediremind.dto.response.AppointmentResponse;
import com.mediremind.enums.AppointmentStatus;
import com.mediremind.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> addAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.addAppointment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        List<AppointmentResponse> response = appointmentService.getAllAppointments();
        return ResponseEntity
                .ok(ApiResponse.success("Appointments retrieved successfully", response));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getUpcomingAppointments() {
        List<AppointmentResponse> response = appointmentService.getUpcomingAppointments();
        return ResponseEntity
                .ok(ApiResponse.success("Upcoming appointments retrieved successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentResponse response = appointmentService.updateStatus(id, status);
        return ResponseEntity
                .ok(ApiResponse.success("Appointment status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(
            @PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity
                .ok(ApiResponse.success("Appointment deleted successfully"));
    }
}