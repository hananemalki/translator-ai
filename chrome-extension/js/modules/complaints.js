export class ComplaintsModule {
    constructor() {
        this.complaints = [];
    }

    init() {
        this.setupUI();
    }

    setupUI() {
        document.getElementById('newComplaintBtn').addEventListener('click', () => {
        this.showCreateForm();
        });
        
        document.getElementById('cancelComplaintBtn').addEventListener('click', () => {
        this.hideCreateForm();
        });
        
        document.getElementById('submitComplaintBtn').addEventListener('click', () => {
        this.handleCreateComplaint();
        });
    }

    showCreateForm() {
        document.getElementById('createComplaintForm').style.display = 'block';
        document.getElementById('complaintsList').style.display = 'none';
    }

    hideCreateForm() {
        document.getElementById('createComplaintForm').style.display = 'none';
        document.getElementById('complaintsList').style.display = 'block';
        this.clearForm();
    }

    clearForm() {
        document.getElementById('complaintType').value = 'TRANSLATION_ERROR';
        document.getElementById('complaintSubject').value = '';
        document.getElementById('complaintDescription').value = '';
        document.getElementById('complaintError').textContent = '';
    }

    async loadComplaints() {
        const listDiv = document.getElementById('complaintsList');
        listDiv.innerHTML = '<div class="loading">Loading complaints...</div>';
        
        try {
        const response = await chrome.runtime.sendMessage({ action: 'getMyComplaints' });
        
        if (response.success) {
            this.complaints = response.data;
            this.displayComplaints(response.data);
        } else {
            listDiv.innerHTML = `<div class="error">Failed to load complaints</div>`;
        }
        } catch (error) {
        listDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    displayComplaints(complaints) {
        const listDiv = document.getElementById('complaintsList');
        
        if (complaints.length === 0) {
        listDiv.innerHTML = '<div class="empty-state">No complaints yet. Create one to get started!</div>';
        return;
        }
        
        listDiv.innerHTML = complaints.map(c => `
        <div class="complaint-item">
            <div class="complaint-header">
            <span class="complaint-status status-${c.status.toLowerCase()}">${c.status}</span>
            <span class="complaint-date">${new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <h4>${c.subject}</h4>
            <p>${c.description}</p>
            ${c.adminResponse ? `<div class="admin-response">
            <strong>Admin:</strong> ${c.adminResponse}
            </div>` : ''}
        </div>
        `).join('');
    }

    async handleCreateComplaint() {
        const type = document.getElementById('complaintType').value;
        const subject = document.getElementById('complaintSubject').value.trim();
        const description = document.getElementById('complaintDescription').value.trim();
        const errorDiv = document.getElementById('complaintError');
        
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        
        if (!subject || !description) {
        errorDiv.textContent = 'Please fill all fields';
        errorDiv.style.display = 'block';
        return;
        }
        
        const btn = document.getElementById('submitComplaintBtn');
        btn.disabled = true;
        btn.textContent = 'Submitting...';
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'createComplaint',
            data: { subject, description, type }
        });
        
        if (response.success) {
            this.hideCreateForm();
            this.loadComplaints();
        } else {
            errorDiv.textContent = response.error || 'Failed to create complaint';
            errorDiv.style.display = 'block';
        }
        } catch (error) {
        errorDiv.textContent = error.message || 'Failed to create complaint';
        errorDiv.style.display = 'block';
        } finally {
        btn.disabled = false;
        btn.textContent = 'Submit';
        }
    }
}