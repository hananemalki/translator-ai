    export const CONFIG = {
    API: {
        BASE_URL: 'http://localhost:8080/api',
        ENDPOINTS: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        USERS: '/auth/users',
        PROMOTE_ADMIN: '/auth/{userId}/promote-to-admin',
        TRANSLATE_TEXT: '/translator/translate/text',
        TRANSLATE_IMAGE: '/translator/translate/image-base64',
        TRANSLATE_AUDIO: '/translator/translate/audio-base64',
        COMPLAINTS: '/complaints',
        MY_COMPLAINTS: '/complaints/my-complaints',
        ALL_COMPLAINTS: '/complaints/all',
        COMPLAINT_STATUS: '/complaints/{id}/status',
        COMPLAINT_RESPONSE: '/complaints/{id}/response',
        COMPLAINT_PRIORITY: '/complaints/{id}/priority'
        }
    },
    
    LIMITS: {
        TEXT_MAX_LENGTH: 500,
        IMAGE_MAX_SIZE: 5 * 1024 * 1024, 
        AUDIO_MAX_SIZE: 10 * 1024 * 1024, 
        HISTORY_MAX_ITEMS: 50
    },
    
    LANGUAGES: [
        { value: 'darija', label: 'Moroccan Darija', flag: '🇲🇦' },
        { value: 'english', label: 'English', flag: '🇬🇧' },
        { value: 'french', label: 'French', flag: '🇫🇷' },
        { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
        { value: 'german', label: 'German', flag: '🇩🇪' },
        { value: 'arabic', label: 'Arabic', flag: '🇸🇦' }
    ],
    
    COMPLAINT_TYPES: [
        { value: 'TRANSLATION_ERROR', label: 'Translation Error' },
        { value: 'TECHNICAL_ISSUE', label: 'Technical Issue' },
        { value: 'FEATURE_REQUEST', label: 'Feature Request' },
        { value: 'ACCOUNT_ISSUE', label: 'Account Issue' },
        { value: 'OTHER', label: 'Other' }
    ],
    
    COMPLAINT_STATUSES: [
        { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
        { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
        { value: 'RESOLVED', label: 'Resolved', color: '#10b981' },
        { value: 'CLOSED', label: 'Closed', color: '#6b7280' }
    ],
    
    COMPLAINT_PRIORITIES: [
        { value: 'LOW', label: 'Low', color: '#6b7280' },
        { value: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
        { value: 'HIGH', label: 'High', color: '#ef4444' },
        { value: 'URGENT', label: 'Urgent', color: '#dc2626' }
    ],
    
    UI: {
        TOOLTIP_AUTO_HIDE_DELAY: 5000,
        NOTIFICATION_DURATION: 2000,
        ANIMATION_DURATION: 300
    }
};

export default CONFIG;