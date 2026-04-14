package com.abr.appscan;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Provides static reference data for the frontend dropdowns.
 * These endpoints were being called by the React app but did not exist,
 * causing silent failures and empty selects.
 */
@RestController
@RequestMapping("/api/meta")
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class MetaController {

    @GetMapping("/applicants")
    public List<String> getApplicants() {
        return List.of(
                "Alice Johnson",
                "Bob Martinez",
                "Carol Lee",
                "David Kim",
                "Emma Thompson",
                "Frank Nguyen",
                "Grace Patel",
                "Henry Okafor"
        );
    }

    @GetMapping("/departments")
    public List<String> getDepartments() {
        return List.of(
                "Computer Science",
                "Biomedical Engineering",
                "Environmental Science",
                "Economics",
                "Physics",
                "Psychology",
                "Materials Science",
                "Data Science"
        );
    }

    @GetMapping("/projects")
    public List<String> getProjects() {
        return List.of(
                "AI-Driven Climate Modeling",
                "Neural Interface Research",
                "Quantum Computing Applications",
                "Genomic Data Analysis",
                "Autonomous Systems Lab",
                "Renewable Energy Optimization",
                "Behavioral Economics Study",
                "Advanced Materials Synthesis"
        );
    }
}
