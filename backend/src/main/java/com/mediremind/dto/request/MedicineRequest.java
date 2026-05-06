package com.mediremind.dto.request;

import com.mediremind.enums.Frequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 100, message = "Medicine name cannot exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Dosage cannot exceed 50 characters")
    private String dosage;

    @NotNull(message = "Frequency is required")
    private Frequency frequency;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @NotEmpty(message = "At least one reminder time is required")
    private List<LocalTime> reminderTimes;
}