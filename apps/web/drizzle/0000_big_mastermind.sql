CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`cnp` text,
	`nume` text,
	`prenume` text,
	`sex` text,
	`data_nasterii` text,
	`telefon` text,
	`email` text,
	`adresa_json` text,
	`act_json` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_cnp_unique` ON `clients` (`cnp`);--> statement-breakpoint
CREATE TABLE `dosare` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'primit' NOT NULL,
	`client_id` text,
	`minutes_saved_est` integer,
	`notes` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`processed_at` text,
	`emis_at` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extractions` (
	`id` text PRIMARY KEY NOT NULL,
	`dosar_id` text NOT NULL,
	`photo_id` text,
	`doc_type` text NOT NULL,
	`fields_json` text NOT NULL,
	`confidence_json` text,
	`model_used` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`dosar_id`) REFERENCES `dosare`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`dosar_id` text NOT NULL,
	`filepath` text NOT NULL,
	`doc_type` text,
	`uploaded_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`purged_at` text,
	FOREIGN KEY (`dosar_id`) REFERENCES `dosare`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` text PRIMARY KEY NOT NULL,
	`dosar_id` text,
	`client_id` text,
	`vehicle_id` text,
	`policy_number` text,
	`insurer` text,
	`type` text,
	`valid_from` text,
	`valid_to` text,
	`source` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`dosar_id`) REFERENCES `dosare`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`plate` text,
	`vin` text,
	`marca` text,
	`model` text,
	`an_fabricatie` text,
	`data_json` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
