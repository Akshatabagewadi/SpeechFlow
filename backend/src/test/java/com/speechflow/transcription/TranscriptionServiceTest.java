package com.speechflow.transcription;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TranscriptionServiceTest {
    @Mock TranscriptionRepository repository;
    @InjectMocks TranscriptionService service;

    @Test void missingRecordThrowsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(TranscriptionNotFoundException.class, () -> service.get(99L));
    }

    @Test void createTrimsFieldsAndReturnsSavedRecord() {
        when(repository.save(any(Transcription.class))).thenAnswer(invocation -> {
            Transcription t = invocation.getArgument(0);
            t.setId(7L);
            return t;
        });
        TranscriptionResponse result = service.create(
            new TranscriptionRequest("  Meeting  ", "  hello world  ", " en-US "));
        assertEquals(7L, result.id());
        assertEquals("Meeting", result.title());
        assertEquals("hello world", result.content());
        assertEquals("en-US", result.language());
    }
}
