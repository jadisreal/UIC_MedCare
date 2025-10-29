export class NotificationService {
    // Simple notification storage in localStorage
    private static readonly STORAGE_KEY = 'notifications';

    // Load notifications from localStorage
    static loadNotifications(): any[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            return [];
        }
    }

    // Save notifications to localStorage
    private static saveNotifications(notifications: any[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    // Create a simple notification
    static createNotification(message: string, type: string = 'info'): void {
        const notifications = this.loadNotifications();
        const newNotification = {
            id: Date.now(),
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        notifications.unshift(newNotification);
        this.saveNotifications(notifications);
    }

    // Mark all notifications as read
    static markAllAsRead(): void {
        const notifications = this.loadNotifications();
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            isRead: true
        }));
        this.saveNotifications(updatedNotifications);
    }

    // Get unread notification count
    static getUnreadCount(): number {
        const notifications = this.loadNotifications();
        return notifications.filter(notification => !notification.isRead).length;
    }

    // Clear all notifications
    static clearAll(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
