-- =============================================
-- Market Lock System — Railway MySQL Init
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ─── app_users ────────────────────────────────
CREATE TABLE IF NOT EXISTS `app_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','vendor') NOT NULL DEFAULT 'vendor',
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `app_users` (`id`, `username`, `email`, `password`, `role`, `full_name`, `phone`, `created_at`) VALUES
(3, 'JJ', 'JamesTiny@gmail.com', '$2b$10$wf3Ng.IvqS.e028gpn.na.x4Af/ugxZyovYSePSVppNUZdytCvzwO', 'vendor', 'James Tiny', '0820398635', '2026-04-05 23:58:05'),
(4, 'Manager', 'Manager@gmail.com', '$2b$10$MxBhSK0q0VAj5Hp/rwv0WurUZ7W1DhvXkIjzcNejbTDomz16EHmD6', 'manager', 'Manager', '1234567890', '2026-04-06 00:36:11'),
(5, 'Admin', 'admin@market.com', '$2b$10$GpJFR/SbZkY4iCRgJRg4BevTnBWYmXfiQhBmhE3ElpxTagiD/9dG.', 'admin', 'Admin', '1111111111', '2026-04-06 00:42:30'),
(6, 'User1', 'User1@gmail.com', '$2b$10$lROHDNdzIEIzvpS8/NO1YeE9.l/.TOMGsNpRZUsBX99Xh5GmH.JSq', 'vendor', 'User1', '1212121212', '2026-04-06 01:46:33');

-- ─── market_locks ─────────────────────────────
CREATE TABLE IF NOT EXISTS `market_locks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `zone` varchar(10) NOT NULL,
  `lock_number` varchar(10) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `price_per_month` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','pending','occupied','maintenance') NOT NULL DEFAULT 'available',
  `owner_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_zone_lock` (`zone`,`lock_number`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `market_locks_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `app_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `market_locks` (`id`, `zone`, `lock_number`, `size`, `price_per_month`, `description`, `status`, `owner_id`, `created_at`) VALUES
(1, 'A', '01', '2x3', 1500.00, 'ล็อคแถวหน้าโซน A', 'occupied', 3, '2026-03-23 00:10:43'),
(2, 'A', '02', '2x3', 1500.00, 'ล็อคแถวหน้าโซน A', 'occupied', 3, '2026-03-23 00:10:43'),
(3, 'A', '03', '3x3', 2000.00, 'ล็อคขนาดใหญ่โซน A', 'occupied', 6, '2026-03-23 00:10:43'),
(4, 'B', '01', '2x3', 1200.00, 'ล็อคโซน B', 'available', NULL, '2026-03-23 00:10:43'),
(5, 'B', '02', '2x3', 1200.00, 'ล็อคโซน B', 'available', NULL, '2026-03-23 00:10:43'),
(6, 'B', '03', '2x3', 1200.00, 'ล็อคโซน B', 'available', NULL, '2026-03-23 00:10:43'),
(7, 'C', '01', '2x2', 800.00, 'ล็อคขนาดเล็กโซน C', 'available', NULL, '2026-03-23 00:10:43'),
(8, 'C', '02', '2x2', 800.00, 'ล็อคขนาดเล็กโซน C', 'available', NULL, '2026-03-23 00:10:43'),
(11, 'A', '04', '2x2', 1000.00, '', 'available', NULL, '2026-04-06 02:37:40');

-- ─── bookings ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `lock_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `lock_id` (`lock_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`lock_id`) REFERENCES `market_locks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `bookings` (`id`, `user_id`, `lock_id`, `start_date`, `end_date`, `total_price`, `note`, `status`, `created_at`) VALUES
(2, 3, 1, '2026-04-06', '2026-04-06', 1500.00, '', 'cancelled', '2026-04-06 00:00:00'),
(3, 3, 1, '2026-04-06', '2026-04-07', 1500.00, 'เสื้อผ้า', 'cancelled', '2026-04-06 00:50:12'),
(4, 3, 1, '2026-04-06', '2026-04-07', 1500.00, 'เสื้อผ้า', 'confirmed', '2026-04-06 00:52:38'),
(5, 3, 2, '2026-04-06', '2026-04-07', 1500.00, '', 'cancelled', '2026-04-06 00:53:59'),
(7, 3, 3, '2026-04-06', '2026-04-07', 2000.00, '', 'cancelled', '2026-04-06 01:05:40'),
(8, 6, 3, '2026-04-06', '2026-04-07', 2000.00, 'ผลไม้', 'confirmed', '2026-04-06 02:33:57'),
(9, 6, 3, '2026-04-06', '2026-04-07', 2000.00, 'ผลไม้', 'cancelled', '2026-04-06 02:34:26');

-- ─── payments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `slip_image` varchar(255) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `transferred_at` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_note` text DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `slip_image`, `bank_name`, `transferred_at`, `status`, `admin_note`, `verified_at`, `created_at`) VALUES
(1, 4, 1500.00, 'slip_1775411567776.jpg', 'กสิกร', '2026-04-06 00:52:00', 'approved', '', '2026-04-06 00:53:21', '2026-04-06 00:52:47'),
(2, 5, 1500.00, 'slip_1775411652363.jpg', 'กสิกร', '2026-04-06 02:56:00', 'rejected', 'ไม่ได้คับ โง่เกินไป', '2026-04-06 00:59:18', '2026-04-06 00:54:12'),
(4, 7, 2000.00, 'slip_1775412347725.jpg', 'กสิกร', '2026-04-06 01:05:00', 'rejected', 'ไม่สามารถจองได้ค่ะ', '2026-04-06 01:29:18', '2026-04-06 01:05:47'),
(5, 8, 2000.00, 'slip_1775417649073.jpg', 'กสิกร', '2026-04-06 02:34:00', 'approved', '', '2026-04-06 02:35:31', '2026-04-06 02:34:09'),
(6, 9, 2000.00, 'slip_1775417674428.jpg', 'กสิกร', '2026-04-06 02:34:00', 'rejected', '-', '2026-04-06 02:35:21', '2026-04-06 02:34:34');

-- ─── sessions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
