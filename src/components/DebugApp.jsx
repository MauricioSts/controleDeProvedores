import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugApp = () => {
  const { user, userId, loading, isAuthorized, userEmail, pendingAuthorization } = useAuth();

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug App</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'exists' : 'null'}</div>
      <div>UserId: {userId || 'null'}</div>
      <div>Email: {userEmail || 'null'}</div>
      <div>Authorized: {isAuthorized ? 'true' : 'false'}</div>
      <div>Pending: {pendingAuthorization ? 'true' : 'false'}</div>
    </div>
  );
};

export default DebugApp;


