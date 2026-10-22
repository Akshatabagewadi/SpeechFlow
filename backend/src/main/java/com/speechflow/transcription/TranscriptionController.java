package com.speechflow.transcription;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transcriptions")
public class TranscriptionController {
    private final TranscriptionService service;
    public TranscriptionController(TranscriptionService service) { this.service = service; }

    @GetMapping
    public List<TranscriptionResponse> list(@RequestParam(required = false) String search) {
        return service.list(search);
    }
    @GetMapping("/{id}")
    public TranscriptionResponse get(@PathVariable Long id) { return service.get(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TranscriptionResponse create(@Valid @RequestBody TranscriptionRequest request) {
        return service.create(request);
    }
    @PutMapping("/{id}")
    public TranscriptionResponse update(@PathVariable Long id, @Valid @RequestBody TranscriptionRequest request) {
        return service.update(id, request);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
