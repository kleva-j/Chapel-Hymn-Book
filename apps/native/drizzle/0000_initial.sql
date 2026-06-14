CREATE TABLE `hymns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`number` integer NOT NULL,
	`language` text,
	`content` text NOT NULL,
	`verses` text NOT NULL,
	`chorus` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_hymns_number` ON `hymns` (`number`);--> statement-breakpoint
CREATE INDEX `idx_hymns_title` ON `hymns` (`title`);--> statement-breakpoint
CREATE INDEX `idx_hymns_content` ON `hymns` (`content`);--> statement-breakpoint
CREATE INDEX `idx_hymns_language` ON `hymns` (`language`);