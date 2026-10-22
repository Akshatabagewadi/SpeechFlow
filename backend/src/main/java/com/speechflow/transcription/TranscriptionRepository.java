
package com.speechflow.transcription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TranscriptionRepository extends JpaRepository<Transcription, Long> {

    @Query("select t from Transcription t " +
           "where lower(t.title) like lower(concat('%', :q, '%')) " +
           "or t.content like concat('%', :q, '%') " +
           "order by t.createdAt desc")
    List<Transcription> search(@Param("q") String query);
}
