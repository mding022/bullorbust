package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.controller.MainController;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class NewsService {
    private final RestTemplate restTemplate = new RestTemplate();
    List<String> newsArr = new ArrayList<String>();
    private final String apiKey = "AIzaSyC2ZzbmY-SkoreIYFXzIlg1ISh7wNhSs0U"; 

    public String generateAIResponse(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Error: API key not set.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        return extractTextFromResponse(response.getBody());
    }

    private String extractTextFromResponse(String responseBody) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(responseBody);
            String res = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            newsArr.add(res);
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing AI response.";
        }
    }

    public List<String> getNewsFeed() {
        return newsArr;
    }
}
