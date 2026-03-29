package com.mediremind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private String userName;
    private long totalMedicines;
    private long todayTaken;
    private long todayMissed;
    private long todayPending;
    private long weeklyTaken;
    private long weeklyMissed;
    private List<MedicineLogResponse> todayLogs;
    private List<AppointmentResponse> upcomingAppointments;
}