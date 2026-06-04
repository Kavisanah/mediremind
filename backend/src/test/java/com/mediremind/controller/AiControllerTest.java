package com.mediremind.controller;

import com.mediremind.service.AiService;
import com.mediremind.security.JwtUtil;
import com.mediremind.security.CustomUserDetailsService;
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

@WebMvcTest(controllers = AiController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiService aiService;

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
}
