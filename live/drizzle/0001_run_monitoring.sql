ALTER TABLE fleet_runs ADD COLUMN phone TEXT;
--> statement-breakpoint
ALTER TABLE fleet_runs ADD COLUMN report_due INTEGER;
--> statement-breakpoint
ALTER TABLE fleet_runs ADD COLUMN reported_at INTEGER;
--> statement-breakpoint
ALTER TABLE fleet_runs ADD COLUMN speed REAL;
--> statement-breakpoint
ALTER TABLE fleet_runs ADD COLUMN speed_limit INTEGER;
--> statement-breakpoint
ALTER TABLE fleet_runs ADD COLUMN camera_url TEXT;
