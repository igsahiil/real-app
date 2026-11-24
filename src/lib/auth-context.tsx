'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { User, AgentProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  agentProfile: AgentProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User; agentProfile?: AgentProfile | null }>;
  registerUser: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ user: User }>;
  registerAgent: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    agencyName?: string;
    licenseNo?: string;
    idProofUrl?: string;
    address?: string;
    bio?: string;
  }) => Promise<{ user: User; agentProfile?: AgentProfile | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/auth/me');
      if (res.data?.data) {
        setUser(res.data.data.user);
        setAgentProfile(res.data.data.agentProfile || null);
      }
    } catch {
      setUser(null);
      setAgentProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password });
    if (res.data?.data) {
      setUser(res.data.data.user);
      setAgentProfile(res.data.data.agentProfile || null);
    }
    return res.data.data;
  };

  const registerUser = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post('/api/v1/auth/register', data);
    if (res.data?.data) {
      setUser(res.data.data.user);
    }
    return res.data.data;
  };

  const registerAgent = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    agencyName?: string;
    licenseNo?: string;
    idProofUrl?: string;
    address?: string;
    bio?: string;
  }) => {
    const res = await api.post('/api/v1/auth/register-agent', data);
    if (res.data?.data) {
      setUser(res.data.data.user);
      setAgentProfile(res.data.data.agentProfile || null);
    }
    return res.data.data;
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } finally {
      setUser(null);
      setAgentProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agentProfile,
        loading,
        login,
        registerUser,
        registerAgent,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
