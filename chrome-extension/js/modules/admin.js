export class AdminModule {
    constructor() {
        this.complaints = [];
        this.users = [];
    }

    init() {
        this.setupUI();
    }

    setupUI() {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            
            if (tab === 'admin-complaints') {
            document.getElementById('adminComplaintsTab').classList.add('active');
            this.loadComplaints();
            } else if (tab === 'admin-users') {
            document.getElementById('adminUsersTab').classList.add('active');
            this.loadUsers();
            }
        });
        });
        
        document.getElementById('statusFilter').addEventListener('change', () => {
        this.loadComplaints();
        });
    }

    async loadComplaints() {
        const listDiv = document.getElementById('adminComplaintsList');
        listDiv.innerHTML = '<div class="loading">Loading complaints...</div>';
        
        try {
        const response = await chrome.runtime.sendMessage({ action: 'getAllComplaints' });
        
        if (response.success) {
            const filter = document.getElementById('statusFilter').value;
            let complaints = response.data;
            
            if (filter !== 'all') {
            complaints = complaints.filter(c => c.status === filter);
            }
            
            this.complaints = complaints;
            this.displayComplaints(complaints);
        } else {
            listDiv.innerHTML = `<div class="error">Failed to load complaints</div>`;
        }
        } catch (error) {
        listDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    displayComplaints(complaints) {
        const listDiv = document.getElementById('adminComplaintsList');
        
        if (complaints.length === 0) {
        listDiv.innerHTML = '<div class="empty-state">No complaints found</div>';
        return;
        }
        
        listDiv.innerHTML = complaints.map(c => `
        <div class="complaint-item admin-complaint" data-complaint-id="${c.id}">
            <div class="complaint-header">
            <span class="complaint-status status-${c.status.toLowerCase()}">${c.status}</span>
            <span class="complaint-priority priority-${c.priority.toLowerCase()}">${c.priority}</span>
            </div>
            <div class="complaint-user">👤 ${c.username}</div>
            <h4>${c.subject}</h4>
            <p>${c.description.substring(0, 100)}${c.description.length > 100 ? '...' : ''}</p>
            <div class="complaint-footer">
            <span>${new Date(c.createdAt).toLocaleDateString()}</span>
            <span class="complaint-type">${c.type.replace('_', ' ')}</span>
            </div>
        </div>
        `).join('');
        
        document.querySelectorAll('.admin-complaint').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.complaintId);
            this.showComplaintDetail(id);
        });
        });
    }

    showComplaintDetail(id) {
        const complaint = this.complaints.find(c => c.id === id);
        if (!complaint) return;
        
        const modal = document.getElementById('complaintDetailModal');
        const content = document.getElementById('complaintDetailContent');
        
        content.innerHTML = `
        <div class="complaint-detail">
            <div class="detail-header">
            <h3>Complaint #${complaint.id}</h3>
            <span class="complaint-status status-${complaint.status.toLowerCase()}">${complaint.status}</span>
            </div>
            
            <div class="detail-info">
            <div class="info-row"><strong>User:</strong> ${complaint.username}</div>
            <div class="info-row"><strong>Type:</strong> ${complaint.type.replace('_', ' ')}</div>
            <div class="info-row"><strong>Priority:</strong> ${complaint.priority}</div>
            <div class="info-row"><strong>Created:</strong> ${new Date(complaint.createdAt).toLocaleString()}</div>
            </div>
            
            <div class="detail-content">
            <h4>Subject</h4>
            <p>${complaint.subject}</p>
            
            <h4>Description</h4>
            <p>${complaint.description}</p>
            
            ${complaint.adminResponse ? `
                <div class="admin-response">
                <h4>Admin Response</h4>
                <p>${complaint.adminResponse}</p>
                <small>By: ${complaint.adminUsername || 'Admin'}</small>
                </div>
            ` : ''}
            </div>
            
            <div class="detail-actions">
            <div class="action-group">
                <label>Status:</label>
                <select id="updateStatus">
                <option value="PENDING" ${complaint.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                <option value="IN_PROGRESS" ${complaint.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                <option value="RESOLVED" ${complaint.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                <option value="CLOSED" ${complaint.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
            
            <div class="action-group">
                <label>Priority:</label>
                <select id="updatePriority">
                <option value="LOW" ${complaint.priority === 'LOW' ? 'selected' : ''}>Low</option>
                <option value="MEDIUM" ${complaint.priority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
                <option value="HIGH" ${complaint.priority === 'HIGH' ? 'selected' : ''}>High</option>
                <option value="URGENT" ${complaint.priority === 'URGENT' ? 'selected' : ''}>Urgent</option>
                </select>
            </div>
            
            <div class="action-group full-width">
                <label>Add Response:</label>
                <textarea id="adminResponseText" rows="3" placeholder="Enter your response..."></textarea>
                <button class="btn-primary-small" id="sendResponseBtn">Send Response</button>
            </div>
            </div>
        </div>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('updateStatus').addEventListener('change', (e) => {
        this.updateComplaintStatus(id, e.target.value);
        });
        
        document.getElementById('updatePriority').addEventListener('change', (e) => {
        this.updateComplaintPriority(id, e.target.value);
        });
        
        document.getElementById('sendResponseBtn').addEventListener('click', () => {
        const responseText = document.getElementById('adminResponseText').value.trim();
        if (responseText) {
            this.addComplaintResponse(id, responseText);
        } else {
            alert('Please enter a response');
        }
        });
    }

    closeComplaintDetail() {
        document.getElementById('complaintDetailModal').style.display = 'none';
    }

    async updateComplaintStatus(id, status) {
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'updateComplaintStatus',
            id: id,
            status: status
        });
        
        if (response.success) {
            alert('Status updated successfully');
            this.loadComplaints();
            this.closeComplaintDetail();
        } else {
            alert('Failed to update status');
        }
        } catch (error) {
        alert('Error: ' + error.message);
        }
    }

    async updateComplaintPriority(id, priority) {
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'updateComplaintPriority',
            id: id,
            priority: priority
        });
        
        if (response.success) {
            alert('Priority updated successfully');
            this.loadComplaints();
        } else {
            alert('Failed to update priority');
        }
        } catch (error) {
        alert('Error: ' + error.message);
        }
    }

    async addComplaintResponse(id, responseText) {
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'addComplaintResponse',
            id: id,
            response: responseText
        });
        
        if (response.success) {
            alert('Response added successfully');
            this.loadComplaints();
            this.closeComplaintDetail();
        } else {
            alert('Failed to add response');
        }
        } catch (error) {
        alert('Error: ' + error.message);
        }
    }

    async loadUsers() {
        const listDiv = document.getElementById('adminUsersList');
        listDiv.innerHTML = '<div class="loading">Loading users...</div>';
        
        try {
        const response = await chrome.runtime.sendMessage({ action: 'getAllUsers' });
        
        if (response.success) {
            this.users = response.data;
            this.displayUsers(response.data);
        } else {
            listDiv.innerHTML = `<div class="error">Failed to load users</div>`;
        }
        } catch (error) {
        listDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    displayUsers(users) {
        const listDiv = document.getElementById('adminUsersList');
        
        if (users.length === 0) {
        listDiv.innerHTML = '<div class="empty-state">No users found</div>';
        return;
        }
        
        listDiv.innerHTML = users.map(u => `
        <div class="user-item">
            <div class="user-info">
            <div class="user-name">
                <strong>${u.username}</strong>
                ${u.roles && u.roles.includes('ADMIN') ? '<span class="admin-badge">Admin</span>' : ''}
            </div>
            <div class="user-email">${u.email}</div>
            </div>
            ${!u.roles || !u.roles.includes('ADMIN') ? `
            <button class="btn-promote" data-user-id="${u.id}" data-username="${u.username}">
                Promote to Admin
            </button>
            ` : '<span class="already-admin">✓ Already Admin</span>'}
        </div>
        `).join('');
        
        document.querySelectorAll('.btn-promote').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.dataset.userId);
            const username = btn.dataset.username;
            this.promoteUser(userId, username);
        });
        });
    }

    async promoteUser(userId, username) {
        if (!confirm(`Promote ${username} to Admin?`)) {
        return;
        }
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'promoteToAdmin',
            userId: userId
        });
        
        if (response.success) {
            alert('User promoted successfully');
            this.loadUsers();
        } else {
            alert('Failed to promote user');
        }
        } catch (error) {
        alert('Error: ' + error.message);
        }
    }
}