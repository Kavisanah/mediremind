package com.mediremind.controller;

import com.mediremind.dto.response.ApiResponse;
import com.mediremind.scheduler.ReminderScheduler;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@Profile({"default", "dev"})
public class JobController {

    private final ReminderScheduler reminderScheduler;

    public JobController(ReminderScheduler reminderScheduler) {
        this.reminderScheduler = reminderScheduler;
    }

    @PostMapping("/trigger-cleanup")
    public ResponseEntity<ApiResponse<String>> triggerCleanup() {
        reminderScheduler.cleanupExpiredRecords();
        return ResponseEntity.ok(ApiResponse.success("Daily record cleanup triggered successfully", null));
    }

    @PostMapping("/trigger-appointments")
    public ResponseEntity<ApiResponse<String>> triggerAppointments() {
        reminderScheduler.sendAppointmentReminders();
        return ResponseEntity.ok(ApiResponse.success("Appointment reminders checking & dispatch completed", null));
    }

    @PostMapping("/trigger-missed-doses")
    public ResponseEntity<ApiResponse<String>> triggerMissedDoses() {
        reminderScheduler.sendMissedDoseAlerts();
        return ResponseEntity.ok(ApiResponse.success("Missed dose alerts checking & dispatch completed", null));
    }
}
