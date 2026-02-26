CREATE TABLE IF NOT EXISTS post_comments (
  id CHAR(36) NOT NULL,
  post_id CHAR(36) NOT NULL,
  parent_comment_id CHAR(36) NULL,
  author VARCHAR(80) NOT NULL,
  content VARCHAR(700) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_post_comments_post_created (post_id, created_at),
  CONSTRAINT fk_post_comments_post
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_post_comments_parent
    FOREIGN KEY (parent_comment_id)
    REFERENCES post_comments(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
