import React from 'react';
import { UserService } from '../services/userService';

const UserInfo: React.FC = () => {
  const user = UserService.getCurrentUser();
  const isLoggedIn = UserService.isLoggedIn();

  if (!isLoggedIn || !user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Status</h3>
        <p className="text-yellow-700">No user logged in. Please sign in with Google.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Authenticated User</h3>
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-medium">Name</p>
            <p className="text-gray-900">{user.name || 'Not available'}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Email</p>
            <p className="text-gray-900">{user.email || 'Not available'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-medium">User ID</p>
            <p className="text-gray-900">{user.user_id || 'Not available'}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Branch ID</p>
            <p className="text-gray-900">{user.branch_id || 'Not available'}</p>
          </div>
        </div>
        
        <div>
          <p className="text-gray-600 font-medium">Branch</p>
          <p className="text-gray-900">{user.branch_name || 'Unknown Branch'}</p>
        </div>
        
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-500">
            Session Status: <span className="text-green-600 font-medium">Active</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
