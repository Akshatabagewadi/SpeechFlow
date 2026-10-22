package com.speechflow.transcription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class TranscriptionService {
    private final TranscriptionRepository repository;
    public TranscriptionService(TranscriptionRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<TranscriptionResponse> list(String search) {
        List<Transcription> rows = search == null || search.isBlank()
            ? repository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
            : repository.search(search.trim());
        return rows.stream().map(TranscriptionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TranscriptionResponse get(Long id) {
        return TranscriptionResponse.from(find(id));
    }

    public TranscriptionResponse create(TranscriptionRequest request) {
        Transcription entity = new Transcription();
        apply(entity, request);
        return TranscriptionResponse.from(repository.save(entity));
    }

    public TranscriptionResponse update(Long id, TranscriptionRequest request) {
        Transcription entity = find(id);
        apply(entity, request);
        return TranscriptionResponse.from(repository.save(entity));
    }

    public void delete(Long id) { repository.delete(find(id)); }

    private Transcription find(Long id) {
        return repository.findById(id).orElseThrow(() ->
            new TranscriptionNotFoundException("Transcription " + id + " was not found"));
    }
    private void apply(Transcription entity, TranscriptionRequest request) {
        entity.setTitle(request.title().trim());
        entity.setContent(request.content().trim());
        entity.setLanguage(request.language().trim());
    }
}
