import { useState, useEffect } from 'react'
import { getUsername, getUserRoles, doLogout, openAccountManagement } from '../../services/keycloakService'
import { 
  User, Mail, Shield, Calendar, Settings, Edit2, ExternalLink, 
  Lock, Bell, Check, X, ChevronRight, AlertCircle, LogOut
} from 'lucide-react'

export default function AccountSettings() {
  const username = getUsername()
  const roles = getUserRoles()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    bookingReminders: true,
    specialOffers: false,
    newsletter: false
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    historyPrivate: false
  })
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserInfo(user)
    setEditForm({
      name: user?.name || username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
    
    const savedPrivacy = localStorage.getItem('privacySettings')
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy))
    }
  }, [username])

  const getRoleLabel = () => {
    if (roles.includes('ADMIN')) return 'Administrator'
    if (roles.includes('SALON_OWNER')) return 'Salon Owner'
    return 'Customer'
  }

  const handleSaveProfile = () => {
    const updatedUser = { ...userInfo, ...editForm }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUserInfo(updatedUser)
    setShowEditModal(false)
    setToastMessage('Profile updated successfully')
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    setShowNotifications(false)
    setToastMessage('Notification preferences saved')
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const handleSavePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy))
    setShowPrivacy(false)
    setToastMessage('Privacy settings saved')
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const handleDeleteAccount = () => {
    localStorage.clear()
    sessionStorage.clear()
    setShowDeleteConfirm(false)
    setTimeout(() => {
      doLogout()
    }, 300)
  }

  // Use Keycloak's built-in account management
  const openKeycloakAccount = () => {
    openAccountManagement()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Header */}
      <div className="bg-black text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden sticky top-6">
              
              {/* Profile Header */}
              <div className="bg-black text-white px-6 py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-4xl font-bold text-black">
                      {username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-1">
                    {userInfo?.name || username}
                  </h2>
                  <p className="text-sm text-gray-400">{userInfo?.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Account Type</p>
                    <p className="text-sm font-bold text-gray-900">{getRoleLabel()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Member Since</p>
                    <p className="text-sm font-bold text-gray-900">
                      {userInfo?.created_timestamp 
                        ? new Date(userInfo.created_timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="text-sm font-bold text-gray-900">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b-2 border-gray-200 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600 mt-1">Your account details and profile data</p>
              </div>
              <div className="p-6">
                <div className="grid gap-5">
                  <InputField icon={<User />} label="Username" value={username} readOnly />
                  <InputField icon={<Mail />} label="Email Address" value={userInfo?.email || 'Not provided'} readOnly />
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    <InputField icon={<Shield />} label="Account Type" value={getRoleLabel()} readOnly />
                    <InputField 
                      icon={<Calendar />} 
                      label="Joined Date" 
                      value={userInfo?.created_timestamp 
                        ? new Date(userInfo.created_timestamp).toLocaleDateString()
                        : 'Recently joined'} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              <ActionCard
                icon={<Settings />}
                title="Keycloak Account"
                description="Manage password and security settings"
                onClick={openKeycloakAccount}
                variant="primary"
              />

              <ActionCard
                icon={<Edit2 />}
                title="Edit Profile"
                description="Update your personal information"
                onClick={() => setShowEditModal(true)}
              />

              <ActionCard
                icon={<Bell />}
                title="Notifications"
                description="Manage notification preferences"
                onClick={() => setShowNotifications(true)}
                badge={Object.values(notifications).filter(Boolean).length}
              />

              <ActionCard
                icon={<Lock />}
                title="Privacy & Security"
                description="Control your privacy settings"
                onClick={() => setShowPrivacy(true)}
              />
            </div>

            {/* Info Banner */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Enterprise Security</h4>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    Your account is protected by Keycloak's enterprise-grade security. For advanced features 
                    like two-factor authentication and session management, visit the Keycloak portal.
                  </p>
                  <button
                    onClick={openKeycloakAccount}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-all"
                  >
                    Open Keycloak
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && <EditProfileModal editForm={editForm} setEditForm={setEditForm} onClose={() => setShowEditModal(false)} onSave={handleSaveProfile} />}
      {showNotifications && <NotificationsModal notifications={notifications} setNotifications={setNotifications} onClose={() => setShowNotifications(false)} onSave={handleSaveNotifications} />}
      {showPrivacy && <PrivacyModal privacy={privacy} setPrivacy={setPrivacy} onClose={() => setShowPrivacy(false)} onSave={handleSavePrivacy} onDelete={() => setShowDeleteConfirm(true)} openKeycloak={openKeycloakAccount} />}
      {showDeleteConfirm && <DeleteConfirmModal onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteAccount} />}

      {/* Toast */}
      {showSuccessToast && <SuccessToast message={toastMessage} />}
    </div>
  )
}

/* =====================================================
   COMPONENTS
===================================================== */

function InputField({ icon, label, value, readOnly }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input 
          type="text" 
          value={value} 
          readOnly={readOnly}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
    </div>
  )
}

function ActionCard({ icon, title, description, onClick, variant, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`group text-left p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all ${
        variant === 'primary' 
          ? 'bg-black text-white border-black hover:bg-gray-900' 
          : 'bg-white text-gray-900 border-gray-200 hover:border-black'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          variant === 'primary' 
            ? 'bg-white/10' 
            : 'bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors'
        }`}>
          <div className={variant === 'primary' ? 'text-white' : 'text-gray-900 group-hover:text-white'}>
            {icon}
          </div>
        </div>
        {badge !== undefined ? (
          <div className="px-2.5 py-1 bg-black text-white rounded-lg text-xs font-bold">
            {badge}
          </div>
        ) : variant === 'primary' ? (
          <ExternalLink className="w-5 h-5 text-white/70" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
        )}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className={`text-sm ${variant === 'primary' ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
    </button>
  )
}

function EditProfileModal({ editForm, setEditForm, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
            <input 
              type="text" 
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
            <input 
              type="email" 
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
            <input 
              type="tel" 
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        <div className="p-6 border-t-2 border-gray-200 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsModal({ notifications, setNotifications, onClose, onSave }: any) {
  const items = [
    { key: 'bookingConfirmations', title: 'Booking Confirmations', desc: 'Get notified when booking is confirmed' },
    { key: 'bookingReminders', title: 'Booking Reminders', desc: 'Receive appointment reminders' },
    { key: 'specialOffers', title: 'Special Offers', desc: 'Updates about promotions' },
    { key: 'newsletter', title: 'Newsletter', desc: 'Weekly newsletter updates' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your notification preferences</p>
        </div>
        <div className="p-6 space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
        <div className="p-6 border-t-2 border-gray-200">
          <button 
            onClick={onSave}
            className="w-full px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

function PrivacyModal({ privacy, setPrivacy, onClose, onSave, onDelete, openKeycloak }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Privacy & Security</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your privacy settings</p>
        </div>
        <div className="p-6 space-y-4">
          
          {/* 2FA Card */}
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-900 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 mb-3">Extra security layer for your account</p>
                <button
                  onClick={openKeycloak}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900"
                >
                  Enable in Keycloak
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Toggles */}
          <PrivacyToggle
            label="Profile Visibility"
            description="Allow others to see your profile"
            checked={privacy.profileVisible}
            onChange={(checked) => setPrivacy({...privacy, profileVisible: checked})}
          />

          <PrivacyToggle
            label="Booking History"
            description="Make booking history private"
            checked={privacy.historyPrivate}
            onChange={(checked) => setPrivacy({...privacy, historyPrivate: checked})}
          />

          {/* Delete Account */}
          <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl">
            <p className="font-bold text-red-900 mb-2">Delete Account</p>
            <p className="text-sm text-red-700 mb-3">
              Clear local data and logout. To permanently delete your account, use Keycloak portal.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Clear & Logout
              </button>
              <button
                onClick={openKeycloak}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black"
              >
                Keycloak
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t-2 border-gray-200">
          <button 
            onClick={onSave}
            className="w-full px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

function PrivacyToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
        </label>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  )
}

function DeleteConfirmModal({ onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-red-600">Clear Data & Logout?</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 font-semibold mb-4">This will:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Clear all local data</li>
            <li>Log you out</li>
            <li>Remove preferences</li>
            <li>End current session</li>
          </ul>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Use Keycloak portal for permanent account deletion.
            </p>
          </div>
        </div>
        <div className="p-6 border-t-2 border-gray-200 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-8 right-8 z-[70] animate-slideUp">
      <div className="bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5" />
        </div>
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  )
}