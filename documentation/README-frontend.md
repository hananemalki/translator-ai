#  Darija Translator - Frontend Application - Hanane Malki

## Project Description

Modern React-based web application for the Darija Translator system. Provides an intuitive user interface for multimodal translation (text, image, audio) with real-time results, user authentication, and comprehensive complaint management dashboard.

##  Architecture

### Technologies Used

- **Framework**: React.js 18+
- **Routing**: React Router DOM
- **Styling**: CSS3 with custom stylesheets
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios for API communication
- **Build Tool**: Create React App
- **Package Manager**: npm

### Project Structure

```
translator-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx          # Login form component
│   │   │   └── Signup.jsx         # Registration form component
│   │   ├── Complaints/
│   │   │   ├── AdminComplaints.jsx     # Admin complaint dashboard
│   │   │   ├── CreateComplaint.jsx     # Complaint creation form
│   │   │   └── UserComplaints.jsx      # User complaint list
│   │   ├── Layout/
│   │   │   ├── Dashboard.jsx      # Main dashboard layout
│   │   │   └── Navbar.jsx         # Navigation bar component
│   │   └── Translator/
│   │       └── ChatTranslator.jsx # Main translation interface
│   ├── context/
│   │   └── AuthContext.js         # Authentication context provider
│   ├── services/
│   │   └── api.js                 # Axios API service configuration
│   ├── css/
│   │   └── [component].css        # Component-specific styles
│   ├── pages/
│   │   └── AdminUsers.js          # Admin user management page
│   ├── App.js                     # Main application component
│   ├── App.css                    # Global application styles
│   ├── index.js                   # Application entry point
│   └── index.css                  # Global CSS styles
├── package.json
└── README.md
```

##  Key Features

### 1. **Authentication System**
- User registration with email validation
- Secure login with Basic Authentication
- Role-based access control (USER/ADMIN)
- Persistent session management
- Protected routes

### 2. **Translation Interface**
- **Text Translation**: Real-time text translation
- **Image Translation**: Upload and translate text from images
- **Audio Translation**: Record or upload audio for translation
- Multi-language support (Darija, French, Spanish, German, Arabic, English)

### 3. **Complaint Management**
- **User Side**:
  - Create complaints with categories
  - View personal complaint history
  - Track complaint status
  - Receive admin responses
- **Admin Side**:
  - View all complaints
  - Filter by status and priority
  - Update complaint status
  - Add responses to complaints
  - Set priorities
  - View statistics dashboard

### 4. **Admin Panel**
- User management
- Promote users to admin role
- View all registered users
- Complaint statistics and analytics

##  Installation and Setup

### Prerequisites

- Node.js 14+ and npm
- Running backend API (see backend README)

### Installation Steps

1. **Clone the repository**
```bash
git clone [REPO_URL]
cd translator-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure API endpoint**

Edit `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:8080/api';
```

4. **Start development server**
```bash
npm start
# or
yarn start
```

5. **Access the application**
```
http://localhost:3000
```

##  Dependencies

### Main Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "react-icons": "^4.x"
  }
}
```

### Key Libraries

- **axios**: HTTP client for API requests with interceptors
- **react-router-dom**: Client-side routing with protected routes
- **react-icons**: Icon library 
- **react-context**: Built-in state management for authentication


**Key Features**:
- Persistent authentication via localStorage
- Login/signup/logout functions
- Role checking (isAdmin)
- Token management
- Global user state

##  Component Overview

### Authentication Components

#### **Login.jsx**

**Features**:
- Username and password authentication
- Form validation with error messages
- Loading state during authentication
- Redirect to dashboard on success
- Link to signup page


#### **Signup.jsx**
- Registration form with validation
- Password strength indicator
- Email format validation
- Username availability check
- Automatic login after registration

### Translation Components

#### **ChatTranslator.jsx**
- **Main Features**:
  - Tab-based interface (Text/Image/Audio)
  - Language selector with flags
  - Real-time translation results
  - Translation history
  - Copy to clipboard functionality
  - Clear conversation
  - Loading states and animations

- **Text Translation**:
  - Text area input
  - Character counter
  - Source and target language selection
  - Instant translation

- **Image Translation**:
  - Drag-and-drop file upload
  - Image preview
  - Supported formats: JPG, PNG, GIF
  - Base64 encoding

- **Audio Translation**:
  - Audio recording with MediaRecorder API
  - Audio file upload
  - Waveform visualization
  - Playback controls

### Complaint Components

#### **CreateComplaint.jsx**
- Complaint type selection
- Subject and description inputs
- Form validation
- Success/error notifications

#### **UserComplaints.jsx**

**Features**:
- Display user's personal complaints
- Status badges with icons (Pending, In Progress, Resolved, Rejected)
- Priority indicators (Low, Medium, High, Urgent)
- Admin response display
- Empty state when no complaints
- Create new complaint button
- React Icons (HiOutline* from react-icons/hi2)




#### **AdminComplaints.jsx**

**Admin Dashboard Features**:
- View all complaints from all users
- Filter by status (ALL, PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- Statistics dashboard showing:
  - Total complaints
  - Pending count
  - In Progress count
  - Resolved count
- Status management dropdown for each complaint
- Priority management (LOW, MEDIUM, HIGH, URGENT)
- Add admin responses with textarea
- Delete complaints
- Display user who created complaint
- Show creation date

### Layout Components

#### **Dashboard.jsx**

**Dashboard Features**:
- Personalized welcome message with username
- Large feature card for Chat Translator
- Visual split-screen layout with chatbot image
- Feature highlights with icons:
  - Text translation
  - Image OCR
  - Audio translation
  - Gemini AI integration
- Recent complaints display for users
- Admin-only quick access cards:
  - Admin Complaints management
  - User Management


#### **Navbar.jsx**

**Navigation Features**:
- Responsive navigation with logo
- Conditional rendering based on authentication status
- Role-based menu items (Admin dropdown for admin users)
- User profile display with username and role badge
- Logout functionality
- React Icons integration
- Dropdown menu for admin section with hover effect


### Authentication Flow

1. User enters credentials
2. Frontend sends request to `/api/auth/login`
3. Backend validates and returns token
4. Token stored in localStorage
5. Token sent with every API request via Authorization header

##  Testing

### Quick Test Credentials

**Admin Account**:
```
Username: admin
Password: admin123
```

Use these credentials to test admin features including:
- User management
- All complaints dashboard
- Status and priority updates
- Admin responses


##  Author

**Hanane Malki**  
Project developed as part of the Generative AI module


### Technical Highlights

**Modern React Architecture**: Functional components with hooks  
**Clean Code**: Component-based architecture with separation of concerns  
**State Management**: Context API for global state  
**API Integration**: Centralized axios configuration with interceptors  
**Responsive Design**: Mobile-first approach with media queries  
**User Experience**: Loading states, error handling, and user feedback  
**Security**: Protected routes and role-based access control  
!**Scalability**: Modular structure for easy feature additions  

### Key Learning Outcomes

- React component lifecycle and hooks
- Client-side routing with React Router
- RESTful API integration
- Authentication and authorization
- State management patterns
- Responsive web design
- User interface best practices
- Modern JavaScript (ES6+)

### Project Complexity

This frontend application demonstrates:
- Advanced React patterns
- Complex state management
- Multi-step forms
- File upload handling
- Real-time features
- Admin dashboards
- Role-based UI rendering