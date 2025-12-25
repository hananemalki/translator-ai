package org.mql.ai.buisness;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mql.ai.models.TranslationRequest;
import org.mql.ai.models.TranslationResponse;
import org.mql.ai.models.TranslationType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
@PropertySource("classpath:prompts.properties")
public class TranslationServiceDefault implements TranslationService {
    
	private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    // Text prompts
    @Value("${prompt.text.darija}")
    private String promptDarija;
    
    @Value("${prompt.text.french}")
    private String promptFrench;
    
    @Value("${prompt.text.spanish}")
    private String promptSpanish;
    
    @Value("${prompt.text.german}")
    private String promptGerman;
    
    @Value("${prompt.text.arabic}")
    private String promptArabic;
    
    // Image prompts
    @Value("${prompt.image.darija}")
    private String promptImageDarija;
    
    @Value("${prompt.image.french}")
    private String promptImageFrench;
    
    @Value("${prompt.image.arabic}")
    private String promptImageArabic;
    
    @Value("${prompt.detect.language}")
    private String promptDetectLanguage;
    
    public TranslationServiceDefault(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    @Override
    public TranslationResponse translateText(TranslationRequest request) throws Exception {
        validateTextRequest(request);
        
        if (request.getType() != null && request.getType() != TranslationType.TEXT) {
            throw new IllegalArgumentException("Invalid request type for text translation");
        }
        
        String prompt = getPromptForLanguage(request.getTargetLanguage(), request.getText());
        String translation = callGeminiAPI(prompt, null, null);
        
        return buildTextResponse(request, translation);
    }
    
    @Override
    public TranslationResponse translateImage(TranslationRequest request) throws Exception {
        validateImageRequest(request);
        
        if (request.getType() != null && request.getType() != TranslationType.IMAGE) {
            throw new IllegalArgumentException("Invalid request type for image translation");
        }
        
        String prompt = getImagePromptForLanguage(request.getTargetLanguage());
        String result = callGeminiAPI(prompt, request.getImageBase64(), "image/jpeg");
        
        return buildImageResponse(request, result);
    }
    
    @Override
    public TranslationResponse translateAudio(TranslationRequest request) throws Exception {
        validateAudioRequest(request);
        
        if (request.getType() != null && request.getType() != TranslationType.AUDIO) {
            throw new IllegalArgumentException("Invalid request type for audio translation");
        }
        
        String prompt = getAudioPromptForLanguage(request.getTargetLanguage());
        String translation = callGeminiAPI(prompt, request.getAudioBase64(), "audio/webm");
        
        return buildAudioResponse(request, translation);
    }
    
    @Override
    public String detectLanguage(String text) throws Exception {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text is required for language detection");
        }
        
        String prompt = promptDetectLanguage.replace("{text}", text);
        return callGeminiAPI(prompt, null, null);
    }
    
    @Override
    public List<Map<String, String>> getSupportedLanguages() {
        List<Map<String, String>> languages = new ArrayList<>();
        
        languages.add(createLanguageMap("darija", "Moroccan Darija", "🇲🇦"));
        languages.add(createLanguageMap("french", "French", "🇫🇷"));
        languages.add(createLanguageMap("spanish", "Spanish", "🇪🇸"));
        languages.add(createLanguageMap("german", "German", "🇩🇪"));
        languages.add(createLanguageMap("arabic", "Arabic", "🇸🇦"));
        languages.add(createLanguageMap("english", "English", "🇬🇧"));
        
        return languages;
    }
    
    
    
    
    // Prompt generators
    private String getPromptForLanguage(String targetLang, String text) {
        String prompt = switch (targetLang.toLowerCase()) {
            case "darija", "moroccan" -> promptDarija;
            case "french", "fr" -> promptFrench;
            case "spanish", "es" -> promptSpanish;
            case "german", "de" -> promptGerman;
            case "arabic", "ar" -> promptArabic;
            default -> promptDarija;
        };
        
        return prompt.replace("{text}", text);
    }
    
    // call Gemini API with different media types
    private String callGeminiAPI(String prompt, String mediaBase64, String mimeType) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        
        if (mediaBase64 != null && !mediaBase64.isEmpty() && mimeType != null) {
            Map<String, Object> mediaPart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", mediaBase64);
            mediaPart.put("inline_data", inlineData);
            parts.add(mediaPart);
        }
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);
        requestBody.put("contents", List.of(content));
        
        String response = webClient.post()
            .uri(apiUrl + "?key=" + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();
        
        return extractTranslation(response);
    }
    
    //extract translation from Gemini API response
    private String extractTranslation(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode candidates = root.path("candidates");
        
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode text = candidates.get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text");
            return text.asText().trim();
        }
        
        throw new Exception("Unable to extract translation from Gemini response");
    } 
    private String getImagePromptForLanguage(String targetLang) {
        return switch (targetLang.toLowerCase()) {
            case "darija", "moroccan" -> promptImageDarija;
            case "french", "fr" -> promptImageFrench;
            case "arabic", "ar" -> promptImageArabic;
            default -> promptImageDarija;
        };
    }
    
    private String getAudioPromptForLanguage(String targetLang) {
        String languageInstruction = getLanguageInstruction(targetLang);
        
        return String.format(
            "You are an expert translator specializing in Moroccan Darija and multiple languages.\n\n" +
            "Task: Listen to the audio, transcribe it, and translate to %s\n\n" +
            "Instructions:\n" +
            "1. Listen carefully to the audio recording\n" +
            "2. Transcribe what you hear accurately\n" +
            "3. Translate the transcribed text to %s\n" +
            "4. Return ONLY the final translated text, nothing else\n" +
            "5. Do not include any explanations, metadata, or transcription - only the translation\n" +
            "6. If translating to Darija, use natural Moroccan expressions and dialect\n" +
            "7. Maintain the original tone, context, and meaning\n\n" +
            "Target language: %s\n" +
            "Expected output: Pure translated text only.",
            languageInstruction,
            languageInstruction,
            languageInstruction
        );
    }
    
    private String getLanguageInstruction(String targetLang) {
        return switch (targetLang.toLowerCase()) {
            case "darija", "moroccan" -> "Moroccan Darija (المغربية الدارجة)";
            case "french", "fr" -> "French (Français)";
            case "spanish", "es" -> "Spanish (Español)";
            case "german", "de" -> "German (Deutsch)";
            case "arabic", "ar" -> "Standard Arabic (العربية الفصحى)";
            case "english", "en" -> "English";
            default -> "Moroccan Darija (المغربية الدارجة)";
        };
    }
    
    // Validation methods 
    private void validateTextRequest(TranslationRequest request) {
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Text is required for translation");
        }
        if (request.getTargetLanguage() == null || request.getTargetLanguage().isEmpty()) {
            throw new IllegalArgumentException("Target language is required");
        }
    }
    
    private void validateImageRequest(TranslationRequest request) {
        if (request.getImageBase64() == null || request.getImageBase64().isEmpty()) {
            throw new IllegalArgumentException("Image data is required for translation");
        }
        if (request.getTargetLanguage() == null || request.getTargetLanguage().isEmpty()) {
            throw new IllegalArgumentException("Target language is required");
        }
    }
    
    private void validateAudioRequest(TranslationRequest request) {
        if (request.getAudioBase64() == null || request.getAudioBase64().isEmpty()) {
            throw new IllegalArgumentException("Audio data is required for translation");
        }
        if (request.getTargetLanguage() == null || request.getTargetLanguage().isEmpty()) {
            throw new IllegalArgumentException("Target language is required");
        }
    }
    
    // Response 
    private TranslationResponse buildTextResponse(TranslationRequest request, String translation) {
        TranslationResponse response = new TranslationResponse();
        response.setOriginalText(request.getText());
        response.setTranslatedText(translation);
        response.setSourceLanguage(request.getSourceLanguage());
        response.setTargetLanguage(request.getTargetLanguage());
        response.setImageTranslation(false);
        response.setAudioTranslation(false);
        return response;
    }
    
    private TranslationResponse buildImageResponse(TranslationRequest request, String result) {
        TranslationResponse response = new TranslationResponse();
        response.setTranslatedText(result);
        response.setTargetLanguage(request.getTargetLanguage());
        response.setImageTranslation(true);
        response.setAudioTranslation(false);
        return response;
    }
    
    private TranslationResponse buildAudioResponse(TranslationRequest request, String translation) {
        TranslationResponse response = new TranslationResponse();
        response.setTranslatedText(translation);
        response.setTargetLanguage(request.getTargetLanguage());
        response.setSourceLanguage("auto");
        response.setImageTranslation(false);
        response.setAudioTranslation(true);
        return response;
    }
    
    private Map<String, String> createLanguageMap(String code, String name, String flag) {
        Map<String, String> language = new HashMap<>();
        language.put("code", code);
        language.put("name", name);
        language.put("flag", flag);
        return language;
    }
}