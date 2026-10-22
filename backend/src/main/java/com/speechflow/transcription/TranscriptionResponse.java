package com.speechflow.transcription;

import java.time.LocalDateTime;

public record TranscriptionResponse(
    Long id, String title, String content, String language,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {
    public static TranscriptionResponse from(Transcription t) {
        return new TranscriptionResponse(t.getId(), t.getTitle(), t.getContent(),
            t.getLanguage(), t.getCreatedAt(), t.getUpdatedAt());
    }
}
