import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isLoggedIn, doLogout, getUsername, getUserRoles } from '../../services/keycloakService'
import { 
  connectNotifications, 
  fetchNotificationHistory, 
  markNotificationAsRead,
  type Notification 
} from '../../services/notificationService'
import { 
  Menu, X, Home, Scissors, LayoutDashboard, Calendar, LogOut, 
  Bell, Instagram, Facebook, Twitter, Settings, Heart
} from 'lucide-react'
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([]) // START WITH EMPTY ARRAY
  
  const loggedIn = isLoggedIn()
  const username = getUsername()
  const roles = getUserRoles()

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    doLogout()
    setIsMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!loggedIn) return null
    
    if (roles.includes('ADMIN')) return '/admin/dashboard'
    if (roles.includes('SALON_OWNER')) return '/salon/dashboard'
    if (roles.includes('CUSTOMER')) return '/customer/dashboard'
    
    return null
  }

  const markAsRead = async (notificationId: string) => {
    // Update UI immediately
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    // Update backend
    await markNotificationAsRead(notificationId)
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  const closeMenu = () => setIsMenuOpen(false)

  // Connect to real-time notifications ONLY when logged in
  useEffect(() => {
    if (!loggedIn) {
      setNotifications([]) // Clear notifications on logout
      return
    }

    console.log('🔌 Connecting to notification service...')

    // Fetch notification history on mount
    fetchNotificationHistory()
      .then(history => {
        console.log('📚 Loaded notification history:', history)
        setNotifications(history)
      })
      .catch(err => {
        console.error('❌ Failed to load notification history:', err)
      })

    // Connect to WebSocket for real-time updates
    const cleanup = connectNotifications((newNotification) => {
      console.log('📬 New notification received:', newNotification)
      setNotifications(prev => [newNotification, ...prev])
      
      // Optional: Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/logo.png'
        })
      }
    })

    return cleanup
  }, [loggedIn])

  // Request browser notification permission
  useEffect(() => {
    if (loggedIn && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [loggedIn])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-2 sm:px-4 lg:px-6">

        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={closeMenu}
          >
            {/* Logo */}
            <div className="relative">
            <div className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center bg-white group-hover:bg-gray-50 transition">
            <Scissors
            className="w-5 h-5 text-gray-800 -rotate-45"
            strokeWidth={2} />
            </div>
            </div>        
            {/* Brand Name */}
            <div className="hidden sm:block">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Find<span className="font-bold">My</span>Style
            </h1>
            </div>
          </Link>
          

          {/* Right Side - Desktop Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Social Media Icons - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Instagram"
              >
                 <FaInstagram className="w-4 h-4 text-white" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4 text-white" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Twitter"
              >
                <FaXTwitter className="w-4 h-4 text-white" />
              </a>
            </div>

            {/* Notification Bell */}
            {loggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-700" strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <p className="text-xs text-gray-500">{unreadCount} unread</p>
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                            <p className="text-xs text-gray-400 mt-1">You'll see booking and payment updates here</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                                !notif.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !notif.read ? 'bg-rose-500' : 'bg-gray-300'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 mb-1">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200">
                          <Link 
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                          >
                            View all notifications →
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Burger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" strokeWidth={2} />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-down Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            
            {/* User Info */}
            {loggedIn && (
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{username}</p>
                    <Link 
                      to="/customer/settings"
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      onClick={closeMenu}
                    >
                      Account settings →
                    </Link>
                  </div>
                </div>
                <Link
                  to="/customer/settings"
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  onClick={closeMenu}
                >
                  <Settings className="w-4 h-4 text-gray-700" />
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all group"
                onClick={closeMenu}
              >
                <Home className="w-5 h-5 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                <span className="font-medium group-hover:text-purple-600 transition-colors">Home</span>
              </Link>

              <Link
                to="/salons"
                className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all group"
                onClick={closeMenu}
              >
                <Scissors className="w-5 h-5 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                <span className="font-medium group-hover:text-purple-600 transition-colors">Browse Salons</span>
              </Link>

              {loggedIn && (
                <>
                  <Link
                    to={getDashboardLink() || '/'}
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all group"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard className="w-5 h-5 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                    <span className="font-medium group-hover:text-purple-600 transition-colors">Dashboard</span>
                  </Link>

                  <Link
                    to="/customer/bookings"
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all group"
                    onClick={closeMenu}
                  >
                    <Calendar className="w-5 h-5 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                    <span className="font-medium group-hover:text-purple-600 transition-colors">My Bookings</span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all group"
                    onClick={closeMenu}
                  >
                    <Heart className="w-5 h-5 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                    <span className="font-medium group-hover:text-purple-600 transition-colors">Favorites</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Social Media - Mobile Only */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Follow Us</p>
              <div className="flex items-center space-x-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  <Instagram className="w-5 h-5 text-white" strokeWidth={2} />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  <Facebook className="w-5 h-5 text-white" strokeWidth={2} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg bg-sky-500 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  <Twitter className="w-5 h-5 text-white" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Auth Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {loggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={closeMenu}
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}