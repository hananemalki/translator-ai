package org.mql.ai.buisness;

import java.util.List;
import java.util.Map;

import org.mql.ai.models.TranslationRequest;
import org.mql.ai.models.TranslationResponse;

public interface TranslationService {
    TranslationResponse translateText(TranslationRequest request) throws Exception;
    TranslationResponse translateImage(TranslationRequest request) throws Exception;
    TranslationResponse translateAudio(TranslationRequest request) throws Exception;
    List<Map<String, String>> getSupportedLanguages();
    String detectLanguage(String text) throws Exception;

}
