package org.mql.ai.buisness;

import org.mql.ai.models.Complaint;
import org.mql.ai.models.ComplaintStatus;
import org.mql.ai.models.ComplaintType;
import org.mql.ai.models.Priority;

import java.util.List;
import java.util.Map;

public interface ComplaintService {
    Complaint createComplaint(String username, String subject,String description, ComplaintType type);
    List<Complaint> getAllComplaints();
    List<Complaint> getComplaintsByUsername(String username);
    Complaint getComplaintById(Long id);
    List<Complaint> getComplaintsByStatus(ComplaintStatus status);
    Complaint updateComplaintStatus(Long id, ComplaintStatus status,String adminUsername);
    Complaint addAdminResponse(Long id,String response,String adminUsername);
    Complaint updatePriority(Long id,Priority priority,String adminUsername);
    boolean deleteComplaint(Long id);
    Map<String, Object> getComplaintStats();
}