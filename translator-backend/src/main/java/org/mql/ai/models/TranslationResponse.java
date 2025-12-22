package org.mql.ai.models;

public class TranslationResponse {
	private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private String detectedLanguage;
    private String extractedText; 
    private long timestamp;
    private boolean isImageTranslation;
    private boolean isAudioTranslation;

    public TranslationResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public TranslationResponse(String originalText, String translatedText, String sourceLanguage, String targetLanguage) {
        this.originalText = originalText;
        this.translatedText = translatedText;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.timestamp = System.currentTimeMillis();
    }

	public String getOriginalText() {
		return originalText;
	}

	public void setOriginalText(String originalText) {
		this.originalText = originalText;
	}

	public String getTranslatedText() {
		return translatedText;
	}

	public void setTranslatedText(String translatedText) {
		this.translatedText = translatedText;
	}

	public String getSourceLanguage() {
		return sourceLanguage;
	}

	public void setSourceLanguage(String sourceLanguage) {
		this.sourceLanguage = sourceLanguage;
	}

	public String getTargetLanguage() {
		return targetLanguage;
	}

	public void setTargetLanguage(String targetLanguage) {
		this.targetLanguage = targetLanguage;
	}

	public String getDetectedLanguage() {
		return detectedLanguage;
	}

	public void setDetectedLanguage(String detectedLanguage) {
		this.detectedLanguage = detectedLanguage;
	}

	public String getExtractedText() {
		return extractedText;
	}

	public void setExtractedText(String extractedText) {
		this.extractedText = extractedText;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public boolean isImageTranslation() {
		return isImageTranslation;
	}

	public void setImageTranslation(boolean isImageTranslation) {
		this.isImageTranslation = isImageTranslation;
	}

	public boolean isAudioTranslation() {
		return isAudioTranslation;
	}

	public void setAudioTranslation(boolean isAudioTranslation) {
		this.isAudioTranslation = isAudioTranslation;
	}
    
    

   
}
