package com.abr.appscan;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ApplicationController {

    private final ApplicationRepository repo;
    private final OpenRouterService aiService;

    public ApplicationController(ApplicationRepository repo, OpenRouterService aiService) {
        this.repo = repo;
        this.aiService = aiService;
    }

    @PostMapping
    public ResponseEntity<Application> submit(@RequestBody Application app) {

        // Validation — return 400, not 500
        if (app.getEmail() == null || !app.getEmail().matches("^[\\w._%+\\-]+@[\\w.\\-]+\\.[a-zA-Z]{2,}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }

        if (app.getFundingRequested() == null || app.getFundingRequested() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Funding amount must be greater than zero");
        }

        if (app.getApplicantName() == null || app.getApplicantName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Applicant name is required");
        }

        // AI enrichment — graceful fallback if service is down
        try {
            app.setAiSummary(aiService.summarize(app));
        } catch (Exception e) {
            app.setAiSummary("AI summary unavailable at this time.");
        }
        app.setAiScore(aiService.generateScore(app));

        // Eligibility
        app.setEligibilityStatus(app.getFundingRequested() > 150_000 ? "REVIEW" : "APPROVED");

        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(app));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
