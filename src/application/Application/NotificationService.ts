import { Notification } from "../../components/common/NotificationIcon";

/**
 * Service for showing in-app notifications (success, error, info).
 */
export class NotificationService {
    /** Add a notification (assigns id, timestamp, read) and dispatch to UI. */
    public static addNotification(
        notification: Omit<Notification, "id" | "timestamp" | "read">
    ): Notification {
        const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false
        };
        
        window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
        return newNotification;
    }
    
    /** Create a notification from a task status update (Success/Failed/Pending). */
    public static notifyTaskStatus(
        taskId: string,
        status: string,
        fileName: string
    ): Notification | null {
        // Skip notification if fileName is "Unknown"
        console.log("fileName", fileName);
        if (fileName === "Unknown file") {
            return null;
        }
        
        let type: 'success' | 'error' | 'info' = 'info';
        let message = '';
        
        switch (status) {
            case 'Success':
                type = 'success';
                message = `Processing completed for ${fileName}`;
                break;
            case 'Failed':
                type = 'error';
                message = `Processing failed for ${fileName}`;
                break;
            case 'Pending':
                type = 'info';
                message = `Processing started for ${fileName}`;
                break;
            default:
                type = 'info';
                message = `Task status updated: ${status}`;
        }
        
        return this.addNotification({
            message,
            type
        });
    }
} 