import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'CUSTOMER' | 'SALON' | 'ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('ProtectedRoute - checking auth...')
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]))
        const tokenRoles = tokenData.realm_access?.roles || []
        
        console.log('Token found, roles:', tokenRoles)
        setLoggedIn(true)
        setRoles(tokenRoles)
      } catch (error) {
        console.error('Failed to parse token:', error)
        setLoggedIn(false)
        setRoles([])
      }
    } else {
      console.log('No token found')
      setLoggedIn(false)
      setRoles([])
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!loggedIn) {
    console.log('Not logged in, redirecting to /login')
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    console.log('Missing required role:', requiredRole, ', redirecting to home')
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute - access granted')
  return <>{children}</>
}