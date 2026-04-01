package com.mediremind.controller;

import com.mediremind.dto.response.ApiResponse;
import com.mediremind.dto.response.MedicineLogResponse;
import com.mediremind.service.MedicineLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class MedicineLogController {

    private final MedicineLogService medicineLogService;

    public MedicineLogController(MedicineLogService medicineLogService) {
        this.medicineLogService = medicineLogService;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<MedicineLogResponse>>> getTodayLogs() {
        List<MedicineLogResponse> response = medicineLogService.getTodayLogs();
        return ResponseEntity
                .ok(ApiResponse.success("Today's logs retrieved successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<MedicineLogResponse>>> getLogsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<MedicineLogResponse> response = medicineLogService.getLogsInRange(from, to);
        return ResponseEntity
                .ok(ApiResponse.success("Logs retrieved successfully", response));
    }

    @PutMapping("/{logId}/taken")
    public ResponseEntity<ApiResponse<MedicineLogResponse>> markAsTaken(
            @PathVariable Long logId) {
        MedicineLogResponse response = medicineLogService.markAsTaken(logId);
        return ResponseEntity
                .ok(ApiResponse.success("Medicine marked as taken", response));
    }
}