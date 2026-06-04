package com.mediremind.controller;

import com.mediremind.dto.response.ApiResponse;
import com.mediremind.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/medicine-info")
    public ResponseEntity<ApiResponse<String>> getMedicineInfo(@RequestParam String medicineName) {
        String info = aiService.getMedicineInfo(medicineName);
        return ResponseEntity.ok(ApiResponse.success("AI info retrieved successfully", info));
    }
}
