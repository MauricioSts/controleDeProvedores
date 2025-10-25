import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail } from '../config/adminEmails';

const DebugAdminStatus = () => {
  const { userEmail, user } = useAuth();
  const isAdmin = isAdminEmail(userEmail);

  return (
    <div className="fixed top-20 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2 text-cyan-400">Debug Admin Status</h3>
      <div>Email: {userEmail || 'N/A'}</div>
      <div>Is Admin: {isAdmin ? '✅ YES' : '❌ NO'}</div>
      <div>Provider: {user?.providerData?.[0]?.providerId || 'N/A'}</div>
      <div>UID: {user?.uid || 'N/A'}</div>
      <div className="mt-2 text-yellow-400">
        Admin Emails: {JSON.stringify(['mauriciogear4@gmail.com'])}
      </div>
    </div>
  );
};

export default DebugAdminStatus;


