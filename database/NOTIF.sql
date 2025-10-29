CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,                   -- Which branch this notification belongs to
    type VARCHAR(50) NOT NULL,                -- 'low_stock', 'request', 'system'
    message NVARCHAR(MAX) NOT NULL,
    reference_id INT NULL,                    -- Reference to medicine_id (if applicable)
    is_read BIT DEFAULT 0,                    -- 0 = unread, 1 = read
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_notifications_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    CONSTRAINT FK_notifications_medicine FOREIGN KEY (reference_id) REFERENCES medicines(medicine_id)
);
    
CREATE TABLE branch_requests (
    branch_request_id INT IDENTITY(1,1) PRIMARY KEY,
    from_branch_id INT NOT NULL,        -- branch requesting
    to_branch_id INT NOT NULL,          -- branch supplying
    medicine_id INT NOT NULL,
    medicine_stock_in_id INT NULL,      -- link to stock in (when fulfilled)
    quantity_requested INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending','approved','rejected','completed')),
    requested_by INT NOT NULL,          -- nurse who requested
    confirmed_by INT NULL,              -- nurse who confirmed
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,

    -- Foreign keys
    CONSTRAINT FK_request_from_branch FOREIGN KEY (from_branch_id) REFERENCES branches(branch_id),
    CONSTRAINT FK_request_to_branch FOREIGN KEY (to_branch_id) REFERENCES branches(branch_id),
    CONSTRAINT FK_request_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    CONSTRAINT FK_request_msi FOREIGN KEY (medicine_stock_in_id) REFERENCES medicine_stock_in(medicine_stock_in_id),
    CONSTRAINT FK_request_user FOREIGN KEY (requested_by) REFERENCES users(user_id),
    CONSTRAINT FK_request_confirmed_by FOREIGN KEY (confirmed_by) REFERENCES users(user_id)
);


IF OBJECT_ID('notifications', 'U') IS NOT NULL
    DROP TABLE notifications;


If remaining_stock <= 50, show an alert that shows upper right and disappear in 5seconds, 
and insert a row in notifications.
When Branch A requests stock from Branch B:
Insert a row into branch_requests (status = pending).
Insert a notification for Branch B (to_branch_id).

When the user logs in, fetch /api/notifications for their branch.
Pass it to your NotificationBell component.
Mark as read with an update query:
UPDATE notifications SET is_read = 1 WHERE branch_id = @branch_id;

SELECT * FROM branch_requests;
SELECT * FROM notifications;