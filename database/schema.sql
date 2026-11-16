-- Learning Lab database schema (MySQL 5.7+ / MariaDB 10.3+).
-- Documented in the wiki: Database page. Every table and column here must be documented there.
-- Run once on an empty database, e.g. via phpMyAdmin → Import.
-- Changes after the first deploy go in database/migrations/NNN-description.sql, never by editing this file in place.

SET NAMES utf8mb4;

CREATE TABLE learninglab_users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email          VARCHAR(190) NOT NULL,
  name           VARCHAR(120) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('teacher','admin') NOT NULL DEFAULT 'teacher',
  active         TINYINT(1) NOT NULL DEFAULT 1,
  failed_logins  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learninglab_assignments (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id       CHAR(10) NOT NULL,
  module_key      VARCHAR(40) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT NULL,
  difficulty      ENUM('green','yellow','red','black') NOT NULL DEFAULT 'green',
  status          ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  config          LONGTEXT NOT NULL,
  schema_version  SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  version         INT UNSIGNED NOT NULL DEFAULT 1,
  author_id       INT UNSIGNED NOT NULL,
  updated_by      INT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assignments_public (public_id),
  KEY ix_assignments_module (module_key),
  KEY ix_assignments_author (author_id),
  CONSTRAINT fk_learninglab_assignments_author FOREIGN KEY (author_id) REFERENCES learninglab_users (id),
  CONSTRAINT fk_learninglab_assignments_updated_by FOREIGN KEY (updated_by) REFERENCES learninglab_users (id),
  CONSTRAINT ck_learninglab_assignments_config CHECK (JSON_VALID(config))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learninglab_courses (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id    CHAR(10) NOT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NULL,
  status       ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  version      INT UNSIGNED NOT NULL DEFAULT 1,
  author_id    INT UNSIGNED NOT NULL,
  updated_by   INT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_public (public_id),
  KEY ix_courses_author (author_id),
  CONSTRAINT fk_learninglab_courses_author FOREIGN KEY (author_id) REFERENCES learninglab_users (id),
  CONSTRAINT fk_learninglab_courses_updated_by FOREIGN KEY (updated_by) REFERENCES learninglab_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learninglab_course_items (
  course_id      INT UNSIGNED NOT NULL,
  position       SMALLINT UNSIGNED NOT NULL,
  assignment_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, position),
  UNIQUE KEY uq_course_items_assignment (course_id, assignment_id),
  KEY ix_course_items_assignment (assignment_id),
  CONSTRAINT fk_learninglab_course_items_course FOREIGN KEY (course_id) REFERENCES learninglab_courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_learninglab_course_items_assignment FOREIGN KEY (assignment_id) REFERENCES learninglab_assignments (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anonymous usage counter. No student data: one row per assignment, course (0 = opened on its own) and day.
CREATE TABLE learninglab_attempt_stats (
  assignment_id  INT UNSIGNED NOT NULL,
  course_id      INT UNSIGNED NOT NULL DEFAULT 0,
  day            DATE NOT NULL,
  count          INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (assignment_id, course_id, day),
  CONSTRAINT fk_learninglab_attempt_stats_assignment FOREIGN KEY (assignment_id) REFERENCES learninglab_assignments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learninglab_media (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id      CHAR(10) NOT NULL,
  path           VARCHAR(255) NOT NULL,
  original_name  VARCHAR(255) NOT NULL,
  mime           VARCHAR(60) NOT NULL,
  size           INT UNSIGNED NOT NULL,
  width          INT UNSIGNED NULL,
  height         INT UNSIGNED NULL,
  uploaded_by    INT UNSIGNED NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_public (public_id),
  CONSTRAINT fk_learninglab_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES learninglab_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
