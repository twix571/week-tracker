// sw.js
let scheduleInterval = null;
let targetTime = null; // Format "HH:MM"
let isNotificationEnabled = false;

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Communication link with parent browser app to sync properties dynamically
self.addEventListener('message', event => {
    const data = event.data;
    if (data && data.type === 'SET_SCHEDULE') {
        isNotificationEnabled = data.enabled;
        targetTime = data.time || null;
        
        if (scheduleInterval) clearInterval(scheduleInterval);
        if (isNotificationEnabled && targetTime) {
            // Check status every minute natively inside the worker instance
            scheduleInterval = setInterval(checkNotificationSchedule, 60000);
            checkNotificationSchedule(); 
        }
    }
});

function checkNotificationSchedule() {
    if (!isNotificationEnabled || !targetTime) return;

    const now = new Date();
    const currentHourString = String(now.getHours()).padStart(2, '0');
    const currentMinuteString = String(now.getMinutes()).padStart(2, '0');
    const currentTimeString = `${currentHourString}:${currentMinuteString}`;

    if (currentTimeString === targetTime) {
        self.registration.showNotification('Week Tracker Reminder', {
            body: 'Don\'t forget to update your logs for today!',
            icon: 'icon.png',
            badge: 'badge.png'
        });
    }
}

// Handle incoming remote push events
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Notification', body: 'New Update' };
    const options = {
        body: data.body,
        icon: 'icon.png',
        badge: 'badge.png'
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});