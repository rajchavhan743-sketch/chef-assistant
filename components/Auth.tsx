import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import type { UserProfile } from '../types';
import { Button } from './ui/Button';

interface AuthProps {
  user: UserProfile | null;
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
  onLogout: () => void;
}

const Auth: React.FC<AuthProps> = ({ user, onLoginSuccess, onLogout }) => {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
        <div className="hidden sm:flex flex-col items-start">
            <span className="font-semibold text-sm text-gray-700 leading-tight">{user.name}</span>
        </div>
        <button onClick={onLogout} className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Sign Out</button>
      </div>
    );
  }

  return <GoogleLogin onSuccess={onLoginSuccess} onError={() => console.error('Login Failed')} theme="outline" />;
};

export default Auth;
