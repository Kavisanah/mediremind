package com.mediremind.dto.response;

import com.mediremind.enums.Frequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {

    private Long id;
    private String name;
    private String dosage;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private String prescriptionFile;
    private Boolean isActive;
    private List<LocalTime> reminderTimes;
    private LocalDateTime createdAt;
}