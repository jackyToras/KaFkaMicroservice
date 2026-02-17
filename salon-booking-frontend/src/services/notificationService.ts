// src/services/notificationService.ts

export interface Notification {
  id: string
  type: 'booking' | 'payment'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const connectNotifications = (onNotification: (notif: Notification) => void) => {
  // Connect to your notification service WebSocket
  const ws = new WebSocket('ws://localhost:7000/notifications')
  
  ws.onopen = () => {
    console.log('✅ Connected to notification service')
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const notification: Notification = {
        id: data.id?.toString() || Date.now().toString(),
        type: data.type || 'booking',
        title: data.title,
        message: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false
      }
      console.log('📬 Notification received:', notification)
      onNotification(notification)
    } catch (error) {
      console.error('Failed to parse notification:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error)
  }
  
  ws.onclose = () => {
    console.log('🔌 Disconnected from notification service')
  }
  
  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up WebSocket connection')
    ws.close()
  }
}

// Fetch notification history (optional - can implement later)
export const fetchNotificationHistory = async (): Promise<Notification[]> => {
  try {
    // TODO: Implement API endpoint to fetch past notifications
    // const response = await fetch('http://localhost:7000/api/notifications')
    // const data = await response.json()
    // return data.map(...)
    
    console.log('ℹ️ No notification history endpoint yet')
    return []
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

// Mark notification as read (optional - can implement later)
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    // TODO: Implement API endpoint to mark as read
    // await fetch(`http://localhost:7000/api/notifications/${notificationId}/read`, {
    //   method: 'PUT'
    // })
    
    console.log('ℹ️ Marked notification as read (local only):', notificationId)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}