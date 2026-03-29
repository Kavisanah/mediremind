package com.mediremind.dto.response;

import com.mediremind.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineLogResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String dosage;
    private LocalDateTime scheduledTime;
    private LocalDateTime takenAt;
    private Status status;
}