package com.mediremind.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ObserverLinkResponse {
    private Long id;
    private String patientName;
    private String observerEmail;
    private String observerName;         // null until accepted & observer has account
    private String relationshipLabel;
    private String status;               // PENDING | ACTIVE | REVOKED
    private Boolean notifyMedicineReminder;
    private Boolean notifyMissedDose;
    private Boolean notifyAppointment;
    private Boolean notifyWeeklyReport;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
}
