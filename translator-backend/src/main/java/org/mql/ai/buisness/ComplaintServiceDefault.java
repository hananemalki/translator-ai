package org.mql.ai.buisness;

import org.mql.ai.models.Complaint;
import org.mql.ai.models.ComplaintStatus;
import org.mql.ai.models.ComplaintType;
import org.mql.ai.models.Priority;
import org.mql.ai.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintServiceDefault implements ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    public ComplaintServiceDefault(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Override
    @Transactional
    public Complaint createComplaint(String username, String subject, String description, ComplaintType type) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (subject == null || subject.isEmpty()) {
            throw new IllegalArgumentException("Subject is required");
        }
        if (description == null || description.isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }

        Complaint complaint = new Complaint(username, subject, description, type);
        complaint = complaintRepository.save(complaint);

        System.out.println("New complaint created: " + complaint.getId());
        return complaint;
    }

    @Override
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Complaint> getComplaintsByUsername(String username) {
        return complaintRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @Override
    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id).orElse(null);
    }

    @Override
    public List<Complaint> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    @Transactional
    public Complaint updateComplaintStatus(Long id, ComplaintStatus status, String adminUsername) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setStatus(status);
        complaint.setAdminUsername(adminUsername);
        return complaintRepository.save(complaint);
    }

    @Override
    @Transactional
    public Complaint addAdminResponse(Long id, String response, String adminUsername) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setAdminResponse(response);
        complaint.setAdminUsername(adminUsername);
        complaint.setStatus(ComplaintStatus.RESOLVED);
        return complaintRepository.save(complaint);
    }

    @Override
    @Transactional
    public Complaint updatePriority(Long id, Priority priority, String adminUsername) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setPriority(priority);
        complaint.setAdminUsername(adminUsername);
        return complaintRepository.save(complaint);
    }

    @Override
    @Transactional
    public boolean deleteComplaint(Long id) {
        if (complaintRepository.existsById(id)) {
            complaintRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Map<String, Object> getComplaintStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Complaint> allComplaints = complaintRepository.findAll();

        stats.put("total", allComplaints.size());
        stats.put("pending", countByStatus(allComplaints, ComplaintStatus.PENDING));
        stats.put("inProgress", countByStatus(allComplaints, ComplaintStatus.IN_PROGRESS));
        stats.put("resolved", countByStatus(allComplaints, ComplaintStatus.RESOLVED));
        stats.put("closed", countByStatus(allComplaints, ComplaintStatus.CLOSED));
        stats.put("byType", allComplaints.stream().collect(Collectors.groupingBy(Complaint::getType, Collectors.counting())) );
        stats.put("byPriority", allComplaints.stream().collect(Collectors.groupingBy(Complaint::getPriority, Collectors.counting())) );

        return stats;
    }

    private long countByStatus(List<Complaint> complaints, ComplaintStatus status) {
        return complaints.stream()
                .filter(c -> c.getStatus() == status)
                .count();
    }
}