import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'salon-booking-realm',
  clientId: 'gateway-service',
}

const keycloak = new Keycloak(keycloakConfig)

export const initKeycloak = async (onAuthenticatedCallback: () => void) => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    })

    console.log('✅ Keycloak initialized. Authenticated:', authenticated)

    if (authenticated && keycloak.token) {
      localStorage.setItem('authToken', keycloak.token)
      localStorage.setItem('token', keycloak.token)
      
      const userInfo = await keycloak.loadUserInfo()
      localStorage.setItem('user', JSON.stringify(userInfo))
    }

    keycloak.onTokenExpired = () => {
      console.log('🔄 Token expired, refreshing...')
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed && keycloak.token) {
          console.log('✅ Token refreshed')
          localStorage.setItem('authToken', keycloak.token)
          localStorage.setItem('token', keycloak.token)
        }
      }).catch(() => {
        console.error('❌ Failed to refresh token')
        doLogout()
      })
    }

    onAuthenticatedCallback()
    return authenticated
  } catch (error) {
    console.error('❌ Keycloak error:', error)
    throw error
  }
}

export const doLogin = () => {
  keycloak.login({ redirectUri: window.location.origin })
}

export const doLogout = () => {
  localStorage.clear()
  keycloak.logout({ redirectUri: window.location.origin })
}

export const getToken = () => keycloak?.token || null

export const isLoggedIn = () => !!keycloak.token

export const updateToken = (successCallback: () => void) => {
  return keycloak.updateToken(5).then(successCallback).catch(doLogin)
}

export const getUserId = () => {
  if (!keycloak?.tokenParsed) return null
  return keycloak.tokenParsed.sub
}

export const getUsername = () => keycloak.tokenParsed?.preferred_username

export const getUserRoles = () => keycloak.tokenParsed?.realm_access?.roles || []

export const hasRole = (role: string) => getUserRoles().includes(role)

// Open Keycloak Account Management - uses Keycloak's built-in method
export const openAccountManagement = () => {
  keycloak.accountManagement()
}

export default keycloak