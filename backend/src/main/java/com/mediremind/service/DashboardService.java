package com.mediremind.service;

import com.mediremind.dto.response.AppointmentResponse;
import com.mediremind.dto.response.DashboardResponse;
import com.mediremind.dto.response.MedicineLogResponse;
import com.mediremind.enums.Status;
import com.mediremind.model.User;
import com.mediremind.repository.MedicineLogRepository;
import com.mediremind.repository.MedicineRepository;
import com.mediremind.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SecurityUtils securityUtils;
    private final MedicineRepository medicineRepository;
    private final MedicineLogRepository medicineLogRepository;
    private final MedicineLogService medicineLogService;
    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        User user = securityUtils.getCurrentUser();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();

        long totalMedicines = medicineRepository
                .countByUserIdAndIsActiveTrue(user.getId());

        long todayTaken = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                user.getId(), Status.TAKEN, todayStart, todayEnd);

        long todayMissed = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                user.getId(), Status.MISSED, todayStart, todayEnd);

        long todayPending = totalMedicines - todayTaken - todayMissed;

        long weeklyTaken = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                user.getId(), Status.TAKEN, weekStart, todayEnd);

        long weeklyMissed = medicineLogRepository.countLogsByUserIdAndStatusInRange(
                user.getId(), Status.MISSED, weekStart, todayEnd);

        List<MedicineLogResponse> todayLogs = medicineLogService.getTodayLogs();

        List<AppointmentResponse> upcomingAppointments =
                appointmentService.getUpcomingAppointments();

        return DashboardResponse.builder()
                .userName(user.getName())
                .totalMedicines(totalMedicines)
                .todayTaken(todayTaken)
                .todayMissed(todayMissed)
                .todayPending(todayPending)
                .weeklyTaken(weeklyTaken)
                .weeklyMissed(weeklyMissed)
                .todayLogs(todayLogs)
                .upcomingAppointments(upcomingAppointments)
                .build();
    }
}