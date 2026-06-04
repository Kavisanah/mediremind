package com.mediremind.controller;

import com.mediremind.service.AiService;
import com.mediremind.security.JwtUtil;
import com.mediremind.security.CustomUserDetailsService;
import com.mediremind.security.SecurityUtils;
import com.mediremind.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mediremind.model.User;
import com.mediremind.model.Medicine;
import java.util.List;
import java.util.Collections;

@WebMvcTest(controllers = AiController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiService aiService;

    @MockBean
    private SecurityUtils securityUtils;

    @MockBean
    private MedicineRepository medicineRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Test
    public void testGetMedicineInfo_Success() throws Exception {
        String medicineName = "Aspirin";
        String expectedInfo = "Aspirin is used to treat pain, fever, or inflammation.";

        when(aiService.getMedicineInfo(medicineName)).thenReturn(expectedInfo);

        mockMvc.perform(get("/api/ai/medicine-info")
                .param("medicineName", medicineName)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("AI info retrieved successfully"))
                .andExpect(jsonPath("$.data").value(expectedInfo));
    }

    @Test
    public void testCheckInteractions_Success() throws Exception {
        User user = User.builder().id(1L).email("john@example.com").name("John Doe").build();
        Medicine medicine = Medicine.builder().id(2L).name("Aspirin").user(user).build();

        when(securityUtils.getCurrentUser()).thenReturn(user);
        when(medicineRepository.findByUserIdAndIsActiveTrue(user.getId())).thenReturn(List.of(medicine));
        when(aiService.checkInteractions(List.of("Aspirin"))).thenReturn("No severe interactions.");

        mockMvc.perform(get("/api/ai/check-interactions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Drug interactions checked successfully"))
                .andExpect(jsonPath("$.data").value("No severe interactions."));
    }

    @Test
    public void testParseSchedule_Success() throws Exception {
        String instruction = "twice a day";
        List<String> expectedTimes = List.of("08:00", "20:00");

        when(aiService.parseSchedule(instruction)).thenReturn(expectedTimes);

        mockMvc.perform(get("/api/ai/parse-schedule")
                .param("instruction", instruction)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Schedule parsed successfully by AI"))
                .andExpect(jsonPath("$.data[0]").value("08:00"))
                .andExpect(jsonPath("$.data[1]").value("20:00"));
    }
}
