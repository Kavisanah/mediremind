package com.mediremind.controller;

import com.mediremind.dto.response.ApiResponse;
import com.mediremind.model.Medicine;
import com.mediremind.model.User;
import com.mediremind.repository.MedicineRepository;
import com.mediremind.security.SecurityUtils;
import com.mediremind.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final SecurityUtils securityUtils;
    private final MedicineRepository medicineRepository;

    @GetMapping("/medicine-info")
    public ResponseEntity<ApiResponse<String>> getMedicineInfo(@RequestParam String medicineName) {
        String info = aiService.getMedicineInfo(medicineName);
        return ResponseEntity.ok(ApiResponse.success("AI info retrieved successfully", info));
    }

    @GetMapping("/check-interactions")
    public ResponseEntity<ApiResponse<String>> checkInteractions() {
        User user = securityUtils.getCurrentUser();
        List<String> activeMeds = medicineRepository.findByUserIdAndIsActiveTrue(user.getId())
                .stream()
                .map(Medicine::getName)
                .toList();

        String result = aiService.checkInteractions(activeMeds);
        return ResponseEntity.ok(ApiResponse.success("Drug interactions checked successfully", result));
    }

    @GetMapping("/parse-schedule")
    public ResponseEntity<ApiResponse<List<String>>> parseSchedule(@RequestParam String instruction) {
        List<String> times = aiService.parseSchedule(instruction);
        return ResponseEntity.ok(ApiResponse.success("Schedule parsed successfully by AI", times));
    }
}
