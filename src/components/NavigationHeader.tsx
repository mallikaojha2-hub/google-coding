import React from 'react';
import { UserProfile } from '../types';
import { Shield, MapPin, Award, UserCheck, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';

interface NavigationHeaderProps {
  activeScreen: number;
  setActiveScreen: (screen: number) => void;
  currentUser: UserProfile;
  activePincode: string;
  onPincodeChange: (pincode: string) => void;
  onRoleToggle: () => void;
  pendingQueueCount: number;
  onRefresh: () => void;
  isSimulatingCron: boolean;
  onTriggerCron: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeScreen,
  setActiveScreen,
  currentUser,
  activePincode,
  onPincodeChange,
  onRoleToggle,
  pendingQueueCount,
  onRefresh,
  isSimulatingCron,
  onTriggerCron
}) => {
  const [tempPincode, setTempPincode] = React.useState(activePincode);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(tempPincode)) {
      onPincodeChange(tempPincode);
    } else {
      alert('Please enter a valid 6-digit postal pincode (e.g. 110001 or 600001)');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Role Switcher */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen(1)}>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1A1A1A] tracking-tight leading-none">Community Hero</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Civic Accountability Loop</span>
            </div>
          </div>

          {/* Role Pill Switcher */}
          <div className="flex items-center bg-[#F1F3F6] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => currentUser.role !== 'citizen' && onRoleToggle()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'citizen'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => currentUser.role !== 'admin' && onRoleToggle()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                currentUser.role === 'admin'
                  ? 'bg-[#0F1115] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Queue</span>
              {pendingQueueCount > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center absolute -top-1 -right-1 font-mono">
                  {pendingQueueCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 6-Digit Pincode Search Filter */}
        <form onSubmit={handlePincodeSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={6}
              value={tempPincode}
              onChange={(e) => setTempPincode(e.target.value)}
              placeholder="6-Digit Pincode..."
              className="w-full bg-[#F1F3F6] border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors"
          >
            Filter Box
          </button>
          
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh State"
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* 4-Screen Navigation Loop Tabs */}
        <nav className="flex items-center justify-between md:justify-end gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveScreen(1)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 1
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Hub Map</span>
          </button>

          <button
            onClick={() => setActiveScreen(2)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 2
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Report Wizard</span>
          </button>

          <button
            onClick={() => setActiveScreen(3)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 relative ${
              activeScreen === 3
                ? 'bg-[#0F1115] text-white shadow-md shadow-gray-900/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>3. AI Triage</span>
            {pendingQueueCount > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
            )}
          </button>

          <button
            onClick={() => setActiveScreen(4)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 4
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>4. Civic Guild</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
