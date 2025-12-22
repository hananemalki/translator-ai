package org.mql.ai.controllers;

import org.mql.ai.buisness.TranslationService;
import org.mql.ai.models.ErrorResponse;
import org.mql.ai.models.TranslationRequest;
import org.mql.ai.models.TranslationResponse;
import org.mql.ai.models.TranslationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/translator")
@CrossOrigin(origins = "*")
public class TranslatorRestController {
    
    @Autowired
    private TranslationService translationService;
    
    
    @PostMapping("/translate/text")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> translateText(@Valid @RequestBody TranslationRequest request) {
        try {
            TranslationResponse response = translationService.translateText(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse("TRANSLATION_ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
  
    @PostMapping("/translate/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> translateImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "targetLanguage", defaultValue = "darija") String targetLanguage) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_IMAGE", "Image file is required"));
            }
            
            byte[] imageBytes = image.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            TranslationRequest request = new TranslationRequest();
            request.setImageBase64(base64Image);
            request.setTargetLanguage(targetLanguage);
            request.setType(TranslationType.IMAGE);
            
            TranslationResponse response = translationService.translateImage(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse("IMAGE_TRANSLATION_ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
   
    @PostMapping("/translate/image-base64")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> translateImageBase64(@RequestBody Map<String, String> request) {
        try {
            String base64Image = request.get("imageBase64");
            String targetLanguage = request.getOrDefault("targetLanguage", "darija");
            
            if (base64Image == null || base64Image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_IMAGE", "Base64 image is required"));
            }
            
            TranslationRequest translationRequest = new TranslationRequest();
            translationRequest.setImageBase64(base64Image);
            translationRequest.setTargetLanguage(targetLanguage);
            translationRequest.setType(TranslationType.IMAGE);
            
            TranslationResponse response = translationService.translateImage(translationRequest);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse("IMAGE_TRANSLATION_ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/translate/audio")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> translateAudio(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "targetLanguage", defaultValue = "darija") String targetLanguage) {
        try {
            if (audio.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_AUDIO", "Audio file is required"));
            }
            
            String contentType = audio.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("INVALID_AUDIO_TYPE", "Only audio files are allowed"));
            }
            
            byte[] audioBytes = audio.getBytes();
            String base64Audio = Base64.getEncoder().encodeToString(audioBytes);
            
            TranslationRequest request = new TranslationRequest();
            request.setAudioBase64(base64Audio);
            request.setTargetLanguage(targetLanguage);
            request.setType(TranslationType.AUDIO);
            
            TranslationResponse response = translationService.translateAudio(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse error = new ErrorResponse("AUDIO_TRANSLATION_ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/languages")
    public ResponseEntity<?> getSupportedLanguages() {
        try {
            List<Map<String, String>> languages = translationService.getSupportedLanguages();
            return ResponseEntity.ok(languages);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse("LANGUAGES_ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Enhanced Darija Translator",
            "version", "2.0"
        ));
    }
}