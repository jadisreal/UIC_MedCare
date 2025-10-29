-- First clear child tables (dependent on stock_in, medicines, users, branches)
DELETE FROM medicine_stock_out;
DELETE FROM history_log;

-- Then clear parent-related tables
DELETE FROM medicine_archived;
DELETE FROM medicine_stock_in;
DELETE FROM branch_requests;
DELETE FROM notifications;
DELETE FROM medicines;