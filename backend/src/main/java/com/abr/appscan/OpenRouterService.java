package com.abr.appscan;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openrouter.model:openai/gpt-3.5-turbo}")
    private String model;

    private final RestTemplate restTemplate;

    public OpenRouterService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String summarize(Application app) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenRouter API key is not configured");
        }

        String prompt =
                "You are an expert research grant reviewer. Return ONLY 3 bullet points with NO extra text:\n" +
                        "- Summary: one sentence about the project\n" +
                        "- Risk: the main risk or concern\n" +
                        "- Funding Insight: whether the funding amount seems appropriate\n\n" +
                        "Application details:\n" +
                        "Applicant: " + app.getApplicantName() + "\n" +
                        "Department: " + app.getDepartment() + "\n" +
                        "Project: " + app.getProjectTitle() + "\n" +
                        "Funding Requested: $" + String.format("%,.2f", app.getFundingRequested());

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(message));
        body.put("max_tokens", 300);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        headers.set("HTTP-Referer", "http://localhost:3000");
        headers.set("X-Title", "AppScan AI");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

        if (response.getBody() == null) {
            throw new RuntimeException("Empty response from AI service");
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("No choices in AI response");
        }

        Map<String, Object> messageBody = (Map<String, Object>) choices.get(0).get("message");
        return messageBody.get("content").toString().trim();
    }

    public int generateScore(Application app) {
        int score = 50;

        if (app.getFundingRequested() != null) {
            if (app.getFundingRequested() < 50_000) {
                score += 20;
            } else if (app.getFundingRequested() < 100_000) {
                score += 10;
            }
        }

        if (app.getDepartment() != null) {
            String department = app.getDepartment().toLowerCase();
            if (department.contains("computer") || department.contains("data")) {
                score += 15;
            } else if (department.contains("bio") || department.contains("medical")) {
                score += 10;
            }
        }

        if (app.getProjectTitle() != null) {
            String projectTitle = app.getProjectTitle().toLowerCase();
            if (projectTitle.contains("ai") || projectTitle.contains("machine learning")) {
                score += 20;
            } else if (projectTitle.contains("quantum") || projectTitle.contains("neural")) {
                score += 15;
            } else if (projectTitle.contains("climate") || projectTitle.contains("renewable")) {
                score += 10;
            }
        }

        return Math.min(score, 100);
    }
}
