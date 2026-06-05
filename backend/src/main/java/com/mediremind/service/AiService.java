package com.mediremind.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @SuppressWarnings("unchecked")
    public String getMedicineInfo(String medicineName) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured on the server.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are a medical information assistant. When given a medicine name, respond with a structured summary covering: what it is used for, common dosages, how to take it (with/without food etc), common side effects, important warnings, and drug interactions to be aware of. Keep the response clear and concise. Always end with: \"⚠️ Always consult your doctor or pharmacist before starting, stopping or changing any medicine.\" Format using short paragraphs with emoji section headers."),
                        Map.of(
                                "role", "user",
                                "content", "Tell me about the medicine: " + medicineName)),
                "max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");
        } catch (Exception e) {
            log.error("Error calling Groq API", e);
            throw new RuntimeException("Failed to fetch medicine info from AI: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public String checkInteractions(List<String> medicineNames) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured on the server.");
        }
        if (medicineNames == null || medicineNames.size() < 2) {
            return "";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        String medsList = String.join(", ", medicineNames);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are a clinical pharmacist assistant. Analyze a list of medications currently taken by a single patient for potential negative interactions. If any moderate or severe drug-drug interactions exist, write a concise, professional warning explaining the risks. If there are multiple interactions, format them using clean bullet points (starting with •). If no significant interactions are found, respond with the exact word: 'NONE'. Do not include any other text."),
                        Map.of(
                                "role", "user",
                                "content", "Check interactions for these medicines: " + medsList)),
                "max_tokens", 256);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        String content = ((String) message.get("content")).trim();
                        String clean = content.replaceAll("[*._-]", "").trim();
                        if ("NONE".equalsIgnoreCase(clean) || clean.toLowerCase().contains("no significant interaction")
                                || clean.toLowerCase().contains("no interaction")) {
                            return "";
                        }
                        return content;
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");
        } catch (Exception e) {
            log.error("Error calling Groq API for interactions", e);
            throw new RuntimeException("Failed to check interactions: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> parseSchedule(String instruction) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured on the server.");
        }
        if (instruction == null || instruction.trim().isEmpty()) {
            return Collections.emptyList();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are an expert medical scheduler. Convert a natural language instruction (e.g. 'twice a day: morning and night') into a JSON array of times in 24-hour HH:mm format (e.g. ['08:00', '20:00']). The output must be EXACTLY a valid JSON array of strings and nothing else. Do not include markdown code block formatting (like ```json), explanations, or any other text. Example Output: [\"08:00\", \"20:00\"]"),
                        Map.of(
                                "role", "user",
                                "content", "Convert this instruction to times: " + instruction)),
                "max_tokens", 256);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        String content = ((String) message.get("content")).trim();
                        if (content.startsWith("```")) {
                            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
                        }
                        ObjectMapper mapper = new ObjectMapper();
                        return mapper.readValue(content, List.class);
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");
        } catch (Exception e) {
            log.error("Error calling Groq API for schedule parsing", e);
            throw new RuntimeException("Failed to parse schedule with AI: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public String generateCoachingTip(String userName, long taken, long missed) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured on the server.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        long total = taken + missed;
        int pct = total > 0 ? (int) Math.round((taken * 100.0) / total) : 0;

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are an empathetic, encouraging AI health coach. Given a user's weekly medicine compliance stats (taken vs missed doses), generate a brief, supportive, one-to-two sentence coaching tip or word of encouragement. Be direct and concise. Avoid medical jargon or prescriptive diagnoses."),
                        Map.of(
                                "role", "user",
                                "content", String.format("User: %s, Taken: %d, Missed: %d, Adherence: %d%%. Generate a tip.", userName, taken, missed, pct))),
                "max_tokens", 128);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        return ((String) message.get("content")).trim();
                    }
                }
            }
            throw new RuntimeException("Empty or invalid response from Groq API");
        } catch (Exception e) {
            log.error("Error calling Groq API for coaching tip", e);
            throw new RuntimeException("Failed to generate coaching tip: " + e.getMessage());
        }
    }
}
