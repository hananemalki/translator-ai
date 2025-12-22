package org.mql.ai.models;

public class TranslationRequest {
	private String text;
    private String sourceLanguage;
    private String targetLanguage;
    private TranslationType type; 
    private String imageBase64; 
    private String audioBase64; 
    
    public TranslationRequest() {
        this.type = TranslationType.TEXT;
        this.sourceLanguage = "auto"; 
    }

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
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

	public TranslationType getType() {
		return type;
	}

	public void setType(TranslationType type) {
		this.type = type;
	}

	public String getImageBase64() {
		return imageBase64;
	}

	public void setImageBase64(String imageBase64) {
		this.imageBase64 = imageBase64;
	}

	public String getAudioBase64() {
		return audioBase64;
	}

	public void setAudioBase64(String audioBase64) {
		this.audioBase64 = audioBase64;
	}

    
}