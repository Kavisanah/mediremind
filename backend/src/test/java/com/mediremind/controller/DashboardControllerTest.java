package com.mediremind.controller;

import com.mediremind.dto.response.DashboardResponse;
import com.mediremind.service.DashboardService;
import com.mediremind.security.JwtUtil;
import com.mediremind.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Test
    public void testGetDashboard_Success() throws Exception {
        DashboardResponse mockResponse = DashboardResponse.builder()
                .userName("John Doe")
                .totalMedicines(5)
                .todayTaken(2)
                .todayMissed(1)
                .todayPending(2)
                .weeklyTaken(10)
                .weeklyMissed(2)
                .todayLogs(Collections.emptyList())
                .upcomingAppointments(Collections.emptyList())
                .build();

        when(dashboardService.getDashboard()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Dashboard retrieved successfully"))
                .andExpect(jsonPath("$.data.userName").value("John Doe"))
                .andExpect(jsonPath("$.data.totalMedicines").value(5))
                .andExpect(jsonPath("$.data.todayTaken").value(2))
                .andExpect(jsonPath("$.data.todayMissed").value(1))
                .andExpect(jsonPath("$.data.todayPending").value(2))
                .andExpect(jsonPath("$.data.weeklyTaken").value(10))
                .andExpect(jsonPath("$.data.weeklyMissed").value(2));
    }
}
