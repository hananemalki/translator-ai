export class TranslatorModule {
    constructor() {
        this.selectedImageBase64 = null;
        this.selectedAudioBase64 = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingInterval = null;
        this.recordingSeconds = 0;
    }

    init() {
        this.setupTextTranslation();
        this.setupImageTranslation();
        this.setupAudioTranslation();
        this.setupModeSwitch();
        this.listenPendingText();
    }

    setupModeSwitch() {
        document.querySelectorAll('.translation-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.translation-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.translation-mode').forEach(m => m.classList.remove('active'));
            
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            document.getElementById(`${mode}Mode`).classList.add('active');
            
            document.getElementById('outputSection').style.display = 'none';
            document.getElementById('translateStatus').textContent = '';
        });
        });
    }

    setupTextTranslation() {
        const inputText = document.getElementById('inputText');
        const charCount = document.getElementById('charCount');
        
        if (inputText && charCount) {
        inputText.addEventListener('input', () => {
            charCount.textContent = inputText.value.length;
        });
        }
        
        document.getElementById('translateBtn').addEventListener('click', () => this.handleTranslate());
        if (inputText) {
        inputText.addEventListener('keypress', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
            this.handleTranslate();
            }
        });
        }
        
        document.getElementById('copyBtn').addEventListener('click', () => this.copyTranslation());
    }

    async handleTranslate() {
        const text = document.getElementById('inputText').value.trim();
        const targetLanguage = document.getElementById('targetLanguage').value;
        const statusDiv = document.getElementById('translateStatus');
        const outputSection = document.getElementById('outputSection');
        
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
        
        if (!text) {
        this.showStatus(statusDiv, 'Please enter text to translate', 'error');
        return;
        }
        
        const btn = document.getElementById('translateBtn');
        btn.disabled = true;
        btn.textContent = ' Translating...';
        outputSection.style.display = 'none';
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'translate',
            data: {
            text: text,
            targetLanguage: targetLanguage,
            sourceLanguage: 'auto',
            type: 'TEXT'
            }
        });
        
        if (response.success) {
            const translation = response.data.translatedText || response.data.translation;
            document.getElementById('outputText').textContent = translation;
            outputSection.style.display = 'block';
            this.showStatus(statusDiv, ' Translation successful!', 'success');
            this.saveToHistory(text, translation);
        } else {
            this.showStatus(statusDiv, response.error || 'Translation failed', 'error');
        }
        } catch (error) {
        this.showStatus(statusDiv, error.message || 'Translation failed', 'error');
        } finally {
        btn.disabled = false;
        btn.textContent = ' Translate';
        }
    }

    setupImageTranslation() {
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');
        
        imageUploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        document.getElementById('translateImageBtn').addEventListener('click', () => this.handleTranslateImage());
    }

    handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
        this.selectedImageBase64 = e.target.result.split(',')[1];
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('translateImageBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.selectedImageBase64 = null;
        document.getElementById('imageInput').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('translateImageBtn').disabled = true;
    }

    async handleTranslateImage() {
        if (!this.selectedImageBase64) {
        alert('Please select an image first');
        return;
        }
        
        const targetLanguage = document.getElementById('targetLanguage').value;
        const statusDiv = document.getElementById('translateStatus');
        const outputSection = document.getElementById('outputSection');
        const btn = document.getElementById('translateImageBtn');
        
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
        btn.disabled = true;
        btn.textContent = ' Translating...';
        outputSection.style.display = 'none';
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'translateImage',
            data: {
            imageBase64: this.selectedImageBase64,
            targetLanguage: targetLanguage
            }
        });
        
        if (response.success) {
            const translation = response.data.translatedText || response.data.translation;
            document.getElementById('outputText').textContent = translation;
            outputSection.style.display = 'block';
            this.showStatus(statusDiv, ' Image translated!', 'success');
        } else {
            this.showStatus(statusDiv, response.error || 'Translation failed', 'error');
        }
        } catch (error) {
        this.showStatus(statusDiv, error.message || 'Translation failed', 'error');
        } finally {
        btn.disabled = false;
        btn.textContent = ' Translate Image';
        }
    }

    setupAudioTranslation() {
        const audioUploadArea = document.getElementById('audioUploadArea');
        const audioInput = document.getElementById('audioInput');
        const recordBtn = document.getElementById('recordBtn');
        
        audioUploadArea.addEventListener('click', () => audioInput.click());
        audioInput.addEventListener('change', (e) => this.handleAudioSelect(e));
        recordBtn.addEventListener('click', () => this.toggleRecording());
        document.getElementById('translateAudioBtn').addEventListener('click', () => this.handleTranslateAudio());
    }

    handleAudioSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
        alert('Audio must be less than 10MB');
        return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
        this.selectedAudioBase64 = e.target.result.split(',')[1];
        document.getElementById('previewAudio').src = e.target.result;
        document.getElementById('audioPreview').style.display = 'block';
        document.getElementById('translateAudioBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }

    removeAudio() {
        this.selectedAudioBase64 = null;
        document.getElementById('audioInput').value = '';
        document.getElementById('audioPreview').style.display = 'none';
        document.getElementById('translateAudioBtn').disabled = true;
    }

    async toggleRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.stopRecording();
        } else {
        await this.startRecording();
        }
    }

    async startRecording() {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.recordingSeconds = 0;
        
        this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
        
        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = () => {
            this.selectedAudioBase64 = reader.result.split(',')[1];
            document.getElementById('previewAudio').src = reader.result;
            document.getElementById('audioPreview').style.display = 'block';
            document.getElementById('translateAudioBtn').disabled = false;
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };
        
        this.mediaRecorder.start();
        
        document.getElementById('recordBtn').classList.add('recording');
        //   document.getElementById('recordIcon').textContent = '⏹️';
        document.getElementById('recordText').textContent = 'Stop Recording';
        document.getElementById('recordingIndicator').style.display = 'flex';
        
        this.recordingInterval = setInterval(() => {
            this.recordingSeconds++;
            const mins = Math.floor(this.recordingSeconds / 60);
            const secs = this.recordingSeconds % 60;
            document.getElementById('recordTime').textContent = 
            `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
        
        } catch (error) {
        alert('Microphone access denied');
        console.error('Recording error:', error);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        document.getElementById('recordBtn').classList.remove('recording');
        document.getElementById('recordIcon').textContent = '🎤';
        document.getElementById('recordText').textContent = 'Start Recording';
        document.getElementById('recordingIndicator').style.display = 'none';
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }
        }
    }

    async handleTranslateAudio() {
        if (!this.selectedAudioBase64) {
        alert('Please record or upload audio first');
        return;
        }
        
        const targetLanguage = document.getElementById('targetLanguage').value;
        const statusDiv = document.getElementById('translateStatus');
        const outputSection = document.getElementById('outputSection');
        const btn = document.getElementById('translateAudioBtn');
        
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
        btn.disabled = true;
        btn.textContent = ' Translating...';
        outputSection.style.display = 'none';
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'translateAudio',
            data: {
            audioBase64: this.selectedAudioBase64,
            targetLanguage: targetLanguage
            }
        });
        
        if (response.success) {
            const translation = response.data.translatedText || response.data.translation;
            document.getElementById('outputText').textContent = translation;
            outputSection.style.display = 'block';
            this.showStatus(statusDiv, ' Audio translated!', 'success');
        } else {
            this.showStatus(statusDiv, response.error || 'Translation failed', 'error');
        }
        } catch (error) {
        this.showStatus(statusDiv, error.message || 'Translation failed', 'error');
        } finally {
        btn.disabled = false;
        btn.textContent = ' Translate Audio';
        }
    }

    async copyTranslation() {
        const text = document.getElementById('outputText').textContent;
        const btn = document.getElementById('copyBtn');
        
        try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = ' Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
        } catch (error) {
        alert('Failed to copy');
        }
    }

    listenPendingText() {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.pendingText) {
            const text = changes.pendingText.newValue;
            if (!text) return;

            const input = document.getElementById('inputText');
            const charCount = document.getElementById('charCount');

            input.value = text;
            charCount.textContent = text.length;

            chrome.storage.local.remove(['pendingText']);
            }
        });
    }


    saveToHistory(original, translated) {
        chrome.storage.local.get(['history'], (result) => {
        const history = result.history || [];
        history.unshift({ original, translated, timestamp: Date.now() });
        chrome.storage.local.set({ history: history.slice(0, 50) });
        });
    }

    showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-message ${type}`;
    }
}