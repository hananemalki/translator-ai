import CONFIG from '../config.js';

export class ApiService {
    static async request(action, data = {}) {
        return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action, ...data },
            (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else if (response && response.success) {
                resolve(response.data);
            } else {
                reject(new Error(response?.error || 'Request failed'));
            }
            }
        );
        });
    }

    // Authentification
    static async login(credentials) {
        return this.request('login', { credentials });
    }

    static async signup(userData) {
        return this.request('signup', { userData });
    }

    static async logout() {
        return this.request('logout');
    }

    // Traduction
    static async translateText(text, targetLanguage, sourceLanguage = 'auto') {
        return this.request('translate', {
        data: { text, targetLanguage, sourceLanguage, type: 'TEXT' }
        });
    }

    static async translateImage(imageBase64, targetLanguage) {
        return this.request('translateImage', {
        data: { imageBase64, targetLanguage }
        });
    }

    static async translateAudio(audioBase64, targetLanguage) {
        return this.request('translateAudio', {
        data: { audioBase64, targetLanguage }
        });
    }

    // Réclamations (User)
    static async createComplaint(complaintData) {
        return this.request('createComplaint', { data: complaintData });
    }

    static async getMyComplaints() {
        return this.request('getMyComplaints');
    }

    // Réclamations (Admin)
    
    static async getAllComplaints() {
        return this.request('getAllComplaints');
    }

    static async updateComplaintStatus(id, status) {
        return this.request('updateComplaintStatus', { id, status });
    }

    static async updateComplaintPriority(id, priority) {
        return this.request('updateComplaintPriority', { id, priority });
    }

    static async addComplaintResponse(id, response) {
        return this.request('addComplaintResponse', { id, response });
    }

    
    // Gestion des utilisateurs (Admin)
    
    static async getAllUsers() {
        return this.request('getAllUsers');
    }

    static async promoteToAdmin(userId) {
        return this.request('promoteToAdmin', { userId });
    }
}

export default ApiService;