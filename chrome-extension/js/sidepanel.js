import { AuthModule } from './modules/auth.js';
import { TranslatorModule } from './modules/translator.js';
import { ComplaintsModule } from './modules/complaints.js';
import { AdminModule } from './modules/admin.js';

class DarijaTranslatorApp {
    constructor() {
      this.authModule = new AuthModule();
      this.translatorModule = new TranslatorModule();
      this.complaintsModule = new ComplaintsModule();
      this.adminModule = new AdminModule();
    }

    async init() {
      const isAuthenticated = await this.authModule.init();
      
      if (isAuthenticated) {
        this.showMainScreen();
      } else {
        this.showAuthScreen();
      }
    }

    showAuthScreen() {
      document.getElementById('authScreen').style.display = 'block';
      document.getElementById('mainScreen').style.display = 'none';
      
      this.authModule.setupAuthUI();
      this.authModule.onAuthChange = (authenticated) => {
        if (authenticated) {
          this.showMainScreen();
        }
      };
    }

    showMainScreen() {
      document.getElementById('authScreen').style.display = 'none';
      document.getElementById('mainScreen').style.display = 'block';
      
      const currentUser = this.authModule.getCurrentUser();
      document.getElementById('usernameDisplay').textContent = currentUser.username;
      
      const isAdmin = this.authModule.isAdmin();
      const adminTab = document.querySelector('.nav-btn.admin-only');
      if (adminTab) {
        adminTab.style.display = isAdmin ? 'block' : 'none';
      }
      
      this.setupNavigation();
      
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        await this.authModule.handleLogout();
        location.reload();
      });
      
      this.translatorModule.init();
      this.complaintsModule.init();
      
      if (isAdmin) {
        this.adminModule.init();
      }
      
      this.exposeGlobalMethods();
    }

    setupNavigation() {
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
          
          btn.classList.add('active');
          const view = btn.dataset.view;
          document.getElementById(`${view}View`).classList.add('active');
          
          if (view === 'complaints') {
            this.complaintsModule.loadComplaints();
          } else if (view === 'admin') {
            this.adminModule.loadComplaints();
          }
        });
      });
    }

    exposeGlobalMethods() {
      window.removeImage = () => this.translatorModule.removeImage();
      window.removeAudio = () => this.translatorModule.removeAudio();
      
      window.closeComplaintDetail = () => this.adminModule.closeComplaintDetail();
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new DarijaTranslatorApp();
  app.init();
});