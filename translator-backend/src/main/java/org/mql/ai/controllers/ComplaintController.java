package org.mql.ai.controllers;

import org.mql.ai.buisness.ComplaintService;
import org.mql.ai.models.Complaint;
import org.mql.ai.models.ComplaintStatus;
import org.mql.ai.models.ComplaintType;
import org.mql.ai.models.Priority;
import org.mql.ai.models.ErrorResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {
    
    @Autowired
    private ComplaintService complaintService;
    
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createComplaint(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String subject = request.get("subject");
            String description = request.get("description");
            String typeStr = request.getOrDefault("type", "OTHER");
            
            if (subject == null || subject.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_INPUT", "Subject is required"));
            }
            
            if (description == null || description.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_INPUT", "Description is required"));
            }
            
            ComplaintType type = ComplaintType.valueOf(typeStr.toUpperCase());
            String username = authentication.getName();
            
            Complaint complaint = complaintService.createComplaint(
                username, subject, description, type
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(complaint);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "Failed to create complaint: " + e.getMessage()));
        }
    }
    
   
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllComplaints() {
        try {
            List<Complaint> complaints = complaintService.getAllComplaints();
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
   
    @GetMapping("/my-complaints")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyComplaints(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<Complaint> complaints = complaintService.getComplaintsByUsername(username);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
   
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getComplaintById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Complaint complaint = complaintService.getComplaintById(id);
            
            if (complaint == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("NOT_FOUND", "Complaint not found"));
            }
            
            String username = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !complaint.getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("FORBIDDEN", "Access denied"));
            }
            
            return ResponseEntity.ok(complaint);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getComplaintsByStatus(@PathVariable String status) {
        try {
            ComplaintStatus complaintStatus = ComplaintStatus.valueOf(status.toUpperCase());
            List<Complaint> complaints = complaintService.getComplaintsByStatus(complaintStatus);
            return ResponseEntity.ok(complaints);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_STATUS", "Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String statusStr = request.get("status");
            ComplaintStatus status = ComplaintStatus.valueOf(statusStr.toUpperCase());
            String adminUsername = authentication.getName();
            
            Complaint complaint = complaintService.updateComplaintStatus(id, status, adminUsername);
            return ResponseEntity.ok(complaint);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
   
    @PutMapping("/{id}/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addAdminResponse(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String response = request.get("response");
            
            if (response == null || response.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_INPUT", "Response is required"));
            }
            
            String adminUsername = authentication.getName();
            Complaint complaint = complaintService.addAdminResponse(id, response, adminUsername);
            return ResponseEntity.ok(complaint);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
 
    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String priorityStr = request.get("priority");
            Priority priority = Priority.valueOf(priorityStr.toUpperCase());
            String adminUsername = authentication.getName();
            
            Complaint complaint = complaintService.updatePriority(id, priority, adminUsername);
            return ResponseEntity.ok(complaint);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("INVALID_INPUT", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
   
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        try {
            boolean deleted = complaintService.deleteComplaint(id);
            
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Complaint deleted"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("NOT_FOUND", "Complaint not found"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = complaintService.getComplaintStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
    
    @GetMapping("/types")
    public ResponseEntity<?> getComplaintTypes() {
        try {
            List<Map<String, String>> types = List.of(
                Map.of("code", "TRANSLATION_ERROR", "label", "Erreur de traduction"),
                Map.of("code", "TECHNICAL_ISSUE", "label", "Problème technique"),
                Map.of("code", "FEATURE_REQUEST", "label", "Demande de fonctionnalité"),
                Map.of("code", "ACCOUNT_ISSUE", "label", "Problème de compte"),
                Map.of("code", "OTHER", "label", "Autre")
            );
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", e.getMessage()));
        }
    }
}