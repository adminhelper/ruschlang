CREATE DATABASE IF NOT EXISTS ruschlang
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ruschlang;

CREATE TABLE IF NOT EXISTS restaurants (
  id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  description TEXT NOT NULL,
  photo_url LONGTEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_restaurant_name_geo (name, lat, lng),
  KEY idx_restaurants_updated (updated_at),
  KEY idx_restaurants_coords (lat, lng)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) NOT NULL,
  restaurant_id CHAR(36) NOT NULL,
  reviewer_name VARCHAR(80) NOT NULL DEFAULT '익명',
  rating DECIMAL(2,1) NOT NULL,
  note VARCHAR(300) NOT NULL,
  photo_url LONGTEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_reviews_restaurant (restaurant_id, created_at DESC),
  CONSTRAINT fk_reviews_restaurant
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  author VARCHAR(80) NOT NULL,
  author_role ENUM('guest', 'member', 'admin') NOT NULL DEFAULT 'member',
  content TEXT NOT NULL,
  lat DECIMAL(10, 6) NULL,
  lng DECIMAL(10, 6) NULL,
  address VARCHAR(255) NULL,
  place_name VARCHAR(255) NULL,
  rating DECIMAL(2,1) NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_posts_status_updated (status, updated_at),
  KEY idx_posts_author_role (author_role)
) ENGINE = InnoDB;

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

CREATE TABLE IF NOT EXISTS roadmaps (
  id CHAR(36) NOT NULL,
  title VARCHAR(140) NOT NULL,
  author VARCHAR(60) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  stops VARCHAR(1200) NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_roadmaps_updated (updated_at)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_token_hash (token_hash)
) ENGINE = InnoDB;
