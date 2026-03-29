package com.mediremind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {

    @NotBlank(message = "Doctor name is required")
    @Size(max = 100, message = "Doctor name cannot exceed 100 characters")
    private String doctorName;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @NotNull(message = "Appointment date is required")
    // @FutureOrPresent removed — same-day appointments must be allowed
    private LocalDateTime appointmentDate;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}
