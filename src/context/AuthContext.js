"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Initial load from sessionStorage
  useEffect(() => {
    const loadAuth = () => {
      console.log("[AuthContext] loadAuth started (sessionStorage)");
      try {
        const storedToken = sessionStorage.getItem('token')
        const storedRole = sessionStorage.getItem('role')
        const storedUser = sessionStorage.getItem('user')

        console.log("[AuthContext] Stored data:", { storedToken: !!storedToken, storedRole, hasUser: !!storedUser });

        if (storedToken && storedRole) {
          setToken(storedToken)
          setRole(storedRole)
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser))
            } catch (e) {
              console.error("[AuthContext] Failed to parse stored user")
            }
          }
        } else {
          console.log("[AuthContext] No valid stored session found");
          setToken(null)
          setRole(null)
          setUser(null)
        }
      } catch (e) {
        console.error("[AuthContext] Failed to load auth from storage:", e)
      } finally {
        setAuthLoaded(true)
      }
    }

    loadAuth()

    // storage event doesn't trigger for sessionStorage changes in the same window
    // but we'll keep it for cross-tab sync if they use the same storage later
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'role' || e.key === null) {
        loadAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Verify token with backend
  useEffect(() => {
    let interval;
    if (authLoaded && token && role) {
      console.log(`[AuthContext] verifyToken triggered for ${role}`);
      const verifyToken = async () => {
        try {
          const res = await api.get('/auth/me')
          if (res.data.success) {
            const actualUser = res.data.data
            console.log("[AuthContext] verifyToken success. Role from API:", actualUser.role);
            
            setUser(actualUser)
            if (actualUser.role) {
              setRole(actualUser.role)
              sessionStorage.setItem('role', actualUser.role)
            }
            sessionStorage.setItem('user', JSON.stringify(actualUser))
          }
        } catch (err) {
          console.error("[AuthContext] verifyToken failed:", err.response?.status)
          if (err.response?.status === 401) {
            console.warn("[AuthContext] 401 Unauthorized - logging out");
            logout()
          }
        }
      }
      
      verifyToken()
      
      // Poll every 10s for real-time status and dot updates
      interval = setInterval(verifyToken, 10000)
    }
    return () => clearInterval(interval)
  }, [authLoaded, token])

  // Listen to profile updates to sync state in real-time across the app
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log("[AuthContext] Profile updated event received. Synching user state...");
      const storedUser = sessionStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("[AuthContext] Failed to parse updated user from storage", e)
        }
      }
    }
    window.addEventListener("profileUpdated", handleProfileUpdated)
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated)
  }, [])

  const login = (userData, userToken, userRole) => {
    console.log("[AuthContext] login() called with role:", userRole);
    
    // Set storage FIRST
    sessionStorage.setItem('token', userToken)
    sessionStorage.setItem('role', userRole)
    sessionStorage.setItem('user', JSON.stringify(userData))
    
    // Then set state
    setToken(userToken)
    setRole(userRole)
    setUser(userData)
    
    console.log(`[AuthContext] Redirecting to /${userRole}/dashboard`);
    router.push(`/${userRole}/dashboard`)
  }

  const logout = () => {
    console.log("[AuthContext] logout() called");
    sessionStorage.clear()
    setToken(null)
    setRole(null)
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, role, authLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
