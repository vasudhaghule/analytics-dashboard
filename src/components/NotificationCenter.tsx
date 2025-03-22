import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { format } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const { updates, clearUpdates, isConnected } = useRealtimeUpdates([
    'stock_update',
    'news_alert',
    'weather_update',
    'notification',
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_update':
        return '📈';
      case 'news_alert':
        return '📰';
      case 'weather_update':
        return '🌤️';
      case 'notification':
        return '🔔';
      default:
        return '📌';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'stock_update':
        return 'bg-blue-100 text-blue-800';
      case 'news_alert':
        return 'bg-red-100 text-red-800';
      case 'weather_update':
        return 'bg-green-100 text-green-800';
      case 'notification':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('notifications.title')}</h3>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <button
              onClick={clearUpdates}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('notifications.clearAll')}
            </button>
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {updates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {t('notifications.noUpdates')}
            </p>
          ) : (
            updates.map((update, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${getNotificationColor(update.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{getNotificationIcon(update.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t(`notifications.${update.type}`)}
                    </p>
                    <p className="text-sm mt-1">{update.data.message}</p>
                    <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                      {format(new Date(update.data.timestamp), 'PPpp')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 