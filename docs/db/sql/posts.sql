CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  author VARCHAR(80) NOT NULL,
  author_role ENUM('guest', 'member', 'admin') NOT NULL DEFAULT 'member',
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_posts_status_updated (status, updated_at),
  KEY idx_posts_author_role (author_role)
) ENGINE = InnoDB;
