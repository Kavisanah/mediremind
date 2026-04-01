package com.mediremind.service;

import com.mediremind.dto.response.MedicineLogResponse;
import com.mediremind.enums.Status;
import com.mediremind.model.MedicineLog;
import com.mediremind.model.User;
import com.mediremind.repository.MedicineLogRepository;
import com.mediremind.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineLogService {

    private final MedicineLogRepository medicineLogRepository;
    private final SecurityUtils securityUtils;

    private MedicineLogResponse toResponse(MedicineLog log) {
        return MedicineLogResponse.builder()
                .id(log.getId())
                .medicineId(log.getMedicine().getId())
                .medicineName(log.getMedicine().getName())
                .dosage(log.getMedicine().getDosage())
                .scheduledTime(log.getScheduledTime())
                .takenAt(log.getTakenAt())
                .status(log.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MedicineLogResponse> getTodayLogs() {
        User user = securityUtils.getCurrentUser();
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);
        return medicineLogRepository.findLogsInRange(user.getId(), start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicineLogResponse> getLogsInRange(LocalDate from, LocalDate to) {
        User user = securityUtils.getCurrentUser();
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);
        return medicineLogRepository.findLogsInRange(user.getId(), start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MedicineLogResponse markAsTaken(Long logId) {
        User user = securityUtils.getCurrentUser();
        MedicineLog log = medicineLogRepository
                .findByIdAndMedicineUserId(logId, user.getId())
                .orElseThrow(() -> new RuntimeException("Log not found"));

        log.setStatus(Status.TAKEN);
        log.setTakenAt(LocalDateTime.now());
        medicineLogRepository.save(log);
        return toResponse(log);
    }
}