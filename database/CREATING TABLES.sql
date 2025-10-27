USE meditrack_db;

CREATE TABLE branches (
    branch_id INT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO branches (branch_id, branch_name) VALUES
(1, 'Fr Selga Campus, Davao City, Philippines'),
(2, 'Bonifacio Campus, Davao City, Philippines'),
(3, 'Bajada Campus, Davao City, Philippines (SHS)'),
(4, 'Bajada Campus, Davao City, Philippines (JHS)'),
(5, 'Bajada Campus, Davao City, Philippines (GS)');

SELECT * FROM branches;


IF OBJECT_ID('users', 'U') IS NOT NULL
    DROP TABLE users;

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

INSERT INTO users (user_id, email, branch_id, name, created_at) VALUES
(1, 'fbangoy_230000001354@uic.edu.ph', 1, 'Nurse Francis', GETDATE()),
(2, 'sampon_230000001231@uic.edu.ph', 2, 'Nurse Seb', GETDATE()),
(3, 'scabrera@uic.edu.ph', 1, 'Nurse Sheryl', GETDATE());

INSERT INTO users (user_id, email, branch_id, name, created_at) VALUES
(3, 'scabrera@uic.edu.ph', 1, 'Nurse Sheryl', GETDATE());

INSERT INTO users (user_id, email, branch_id, name, created_at) VALUES
(4, 'rbisnar_230000001886@uic.edu.ph', 2, 'Nurse Bisnar', GETDATE());

SELECT * FROM users;


CREATE TABLE medicines (
    medicine_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_name VARCHAR(255) NOT NULL,
    medicine_category VARCHAR(255) NOT NULL
);


CREATE TABLE medicine_stock_in (
    medicine_stock_in_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    date_received DATE NOT NULL,
    expiration_date DATE NOT NULL,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    timestamp_dispensed DATETIME DEFAULT GETDATE(),
    
    -- foreign keys
    CONSTRAINT FK_medicine_stock_in_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    CONSTRAINT FK_medicine_stock_in_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT FK_medicine_stock_in_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);


CREATE TABLE dbo.medicine_stock_out (
    medicine_stock_out_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_stock_in_id INT NOT NULL,
    quantity_dispensed INT NOT NULL,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    timestamp_dispensed DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_mso_msi FOREIGN KEY (medicine_stock_in_id) REFERENCES dbo.medicine_stock_in(medicine_stock_in_id),
    CONSTRAINT FK_mso_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
    CONSTRAINT FK_mso_branch FOREIGN KEY (branch_id) REFERENCES dbo.branches(branch_id)
);

SELECT * FROM medicine_stock_out;


CREATE TABLE medicine_deleted (
    medicine_deleted_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_stock_in_id INT NOT NULL,
    quantity INT NOT NULL,
    description VARCHAR(MAX) NOT NULL,
    deleted_at DATETIME DEFAULT GETDATE(),
    branch_id INT NOT NULL,

    -- Foreign keys
    CONSTRAINT FK_md_stock_in FOREIGN KEY (medicine_stock_in_id) REFERENCES medicine_stock_in(medicine_stock_in_id),
    CONSTRAINT FK_md_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- Drop old table if it exists
IF OBJECT_ID('medicine_deleted', 'U') IS NOT NULL
    DROP TABLE medicine_deleted;
GO

-- Create the new table with name medicine_archived
CREATE TABLE medicine_archived (
    medicine_archived_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_stock_in_id INT NOT NULL,
    quantity INT NOT NULL,
    description VARCHAR(MAX) NOT NULL,
    archived_at DATETIME DEFAULT GETDATE(),
    branch_id INT NOT NULL,

    -- Foreign keys
    CONSTRAINT FK_ma_stock_in FOREIGN KEY (medicine_stock_in_id) REFERENCES medicine_stock_in(medicine_stock_in_id),
    CONSTRAINT FK_ma_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);


CREATE TABLE history_log (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_id INT NOT NULL,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    activity VARCHAR(20) NOT NULL CHECK (activity IN ('dispensed', 'restocked', 'added', 'removed')),
    quantity INT NOT NULL,
    description VARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),

    -- Foreign keys
    CONSTRAINT FK_history_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    CONSTRAINT FK_history_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    CONSTRAINT FK_history_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,                   -- branch that raised or triggered the notification
    medicine_id INT NOT NULL,                 -- medicine concerned
    type VARCHAR(50) NOT NULL,                -- 'low_stock' or 'request'
    message VARCHAR(MAX) NOT NULL,            -- system-generated text
    quantity INT NULL,                        -- quantity requested (don't show for low stock)
    status VARCHAR(20) DEFAULT 'pending',     -- 'pending', 'confirmed', 'declined' for requests
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,

    -- Foreign keys
    CONSTRAINT FK_notifications_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    CONSTRAINT FK_notifications_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);


-- Read-only view for branch inventory (recommended for "view others' inventory")
-- This view aggregates medicine_stock_in and medicine_stock_out per branch and medicine.
-- Use this view in read-only APIs. If you need extremely high-performance reads, consider
-- a materialized/cache table maintained by triggers or a nightly job (not shown here).
IF OBJECT_ID('vw_branch_inventory', 'V') IS NOT NULL
    DROP VIEW vw_branch_inventory;
GO

CREATE VIEW vw_branch_inventory AS
SELECT
    b.branch_id,
    b.branch_name,
    m.medicine_id,
    m.medicine_name,
    m.medicine_category,
    ISNULL(SUM(msi.quantity), 0) AS total_received,
    ISNULL(SUM(mso.quantity_dispensed), 0) AS total_dispensed,
    (ISNULL(SUM(msi.quantity),0) - ISNULL(SUM(mso.quantity_dispensed),0)) AS remaining_stock,
    MAX(COALESCE(msi.date_received, mso.timestamp_dispensed)) AS last_activity_date
FROM branches b
CROSS JOIN medicines m
LEFT JOIN medicine_stock_in msi
    ON msi.branch_id = b.branch_id
    AND msi.medicine_id = m.medicine_id
LEFT JOIN medicine_stock_out mso
    ON mso.medicine_stock_in_id = msi.medicine_stock_in_id
GROUP BY
    b.branch_id,
    b.branch_name,
    m.medicine_id,
    m.medicine_name,
    m.medicine_category;
GO


SELECT * FROM medicines;
SELECT * FROM medicine_stock_in;
SELECT * FROM medicine_stock_out;
SELECT * FROM medicine_archived;
SELECT * FROM history_log;
