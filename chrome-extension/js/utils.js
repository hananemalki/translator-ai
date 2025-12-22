export const Utils = {
    formatDate(timestamp, includeTime = false) {
        const date = new Date(timestamp);
        const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        };
        return date.toLocaleDateString('en-US', options);
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

   
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        };
    },


    async copyToClipboard(text) {
        try {
        await navigator.clipboard.writeText(text);
        return true;
        } catch (err) {
        console.error('Failed to copy:', err);
        return false;
        }
    },

    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    
    validateImageFile(file, maxSize) {
        if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Please select an image file' };
        }
        if (file.size > maxSize) {
        return { valid: false, error: `Image must be less than ${this.formatFileSize(maxSize)}` };
        }
        return { valid: true };
    },

    
    validateAudioFile(file, maxSize) {
        if (!file.type.startsWith('audio/')) {
        return { valid: false, error: 'Please select an audio file' };
        }
        if (file.size > maxSize) {
        return { valid: false, error: `Audio must be less than ${this.formatFileSize(maxSize)}` };
        }
        return { valid: true };
    },

    
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        });
    },


    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    
    formatRecordingTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    
    getStatusColor(status) {
        const colors = {
        'PENDING': '#f59e0b',
        'IN_PROGRESS': '#3b82f6',
        'RESOLVED': '#10b981',
        'CLOSED': '#6b7280'
        };
        return colors[status] || '#6b7280';
    },

    
    getPriorityColor(priority) {
        const colors = {
        'LOW': '#6b7280',
        'MEDIUM': '#f59e0b',
        'HIGH': '#ef4444',
        'URGENT': '#dc2626'
        };
        return colors[priority] || '#6b7280';
    },

    
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
            element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
        });
        
        children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
        });
        
        return element;
    }
};

export default Utils;