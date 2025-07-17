import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  removeNotification 
} from '@/store/slices/uiSlice';
import { CheckCheck, X } from 'lucide-react';

const NotificationPanel = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadNotificationCount } = useAppSelector((state) => state.ui);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadNotificationCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="h-8 px-2 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-2 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-background border-border' 
                    : 'bg-accent/30 border-accent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          notification.type === 'error' ? 'destructive' :
                          notification.type === 'warning' ? 'secondary' :
                          notification.type === 'success' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;