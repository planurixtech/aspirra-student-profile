-- SQL script to clear and reset Aspirra database tables
PRAGMA foreign_keys = OFF;

-- Delete all records
DELETE FROM "UserProfiles";
DELETE FROM "DashboardStates";
DELETE FROM "WeeklyMinutes";
DELETE FROM "TaskItems";
DELETE FROM "Users";

-- Reset autoincrement counters
DELETE FROM sqlite_sequence WHERE name IN ('UserProfiles', 'DashboardStates', 'Users');

PRAGMA foreign_keys = ON;

-- Seed default application states
INSERT INTO "UserProfiles" ("Id", "Name", "AvatarLetter", "Group", "IsVerified")
VALUES (1, 'Sangeetha', 'S', 'TNPSC Group 1 - 2026', 1);

INSERT INTO "DashboardStates" ("Id", "TargetHours", "CompletedMinutes")
VALUES (1, 4, 60);

INSERT INTO "WeeklyMinutes" ("Day", "Minutes") VALUES
('Mon', 96),
('Tue', 48),
('Wed', 192),
('Thu', 24),
('Fri', 120),
('Sat', 216),
('Sun', 72);

INSERT INTO "TaskItems" ("Id", "Title", "Time", "Completed") VALUES
('task-1', 'Historical Theory', '09 : 00 AM', 0),
('task-2', 'Geography Templates', '10 : 00 AM', 1);
