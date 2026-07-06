CREATE TABLE `favorites` (
	`hymn_id` integer PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hymn_id`) REFERENCES `hymns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_favorites_created_at` ON `favorites` (`created_at`);--> statement-breakpoint
CREATE TABLE `history` (
	`hymn_id` integer PRIMARY KEY NOT NULL,
	`viewed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hymn_id`) REFERENCES `hymns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_history_viewed_at` ON `history` (`viewed_at`);