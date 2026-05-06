package com.mediremind.dto.response;

import com.mediremind.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private Long id;
    private String doctorName;
    private String location;
    private LocalDateTime appointmentDate;
    private String notes;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
}