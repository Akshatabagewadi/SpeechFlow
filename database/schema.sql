CREATE DATABASE IF NOT EXISTS speechflow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE speechflow;

CREATE TABLE IF NOT EXISTS transcriptions (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  content LONGTEXT NOT NULL,
  language VARCHAR(20) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  INDEX idx_transcriptions_created_at (created_at),
  INDEX idx_transcriptions_title (title)
);
