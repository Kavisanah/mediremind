package com.mediremind.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ObserverInviteRequest {

    @Email(message = "Valid email required")
    @NotBlank(message = "Observer email is required")
    private String observerEmail;

    @NotBlank(message = "Relationship label is required (e.g. 'Mom', 'My Son Ravi')")
    @Size(max = 60)
    private String relationshipLabel;

    // Notification preferences — all true by default
    private boolean notifyMedicineReminder = true;
    private boolean notifyMissedDose       = true;
    private boolean notifyAppointment      = true;
    private boolean notifyWeeklyReport     = true;
}
