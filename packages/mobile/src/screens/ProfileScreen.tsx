import React from 'react';
import { MetalContainer } from '../components/MetalContainer';
import { MetalText } from '../components/MetalText';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <MetalContainer>
      <MetalText className="text-2xl mt-8">Profile</MetalText>
      <MetalText className="mt-2">{user?.email}</MetalText>
      <MetalText className="mt-2">Username: {user?.user_metadata?.username}</MetalText>
      <MetalText className="mt-4 text-red-400" onPress={logout}>Logout</MetalText>
    </MetalContainer>
  );
}
