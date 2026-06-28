import React, { useState, useEffect } from 'react';
import { AppState, Ticket, UserProfile } from './types';
import { NavigationHeader } from './components/NavigationHeader';
import { Screen1HomeHub } from './components/Screen1HomeHub';
import { Screen2ReportWizard } from './components/Screen2ReportWizard';
import { Screen3AdminModeration } from './components/Screen3AdminModeration';
import { Screen4CivicGuild } from './components/Screen4CivicGuild';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<number>(1);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulatingCron, setIsSimulatingCron] = useState<boolean>(false);

  // Fetch initial full-stack state
  const fetchGlobalState = async (pincode = '110001', role = 'citizen') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/state?pincode=${pincode}&role=${role}`);
      if (res.ok) {
        const data: AppState = await res.json();
        setAppState(data);
      }
    } catch (err) {
      console.error('Failed to load API state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalState();
  }, []);

  const handlePincodeChange = (newPincode: string) => {
    if (!appState) return;
    fetchGlobalState(newPincode, appState.currentUser.role);
  };

  const handleRoleToggle = () => {
    if (!appState) return;
    const newRole = appState.currentUser.role === 'citizen' ? 'admin' : 'citizen';
    fetchGlobalState(appState.activePincode, newRole);
  };

  // --- API ROUTE HANDLERS ---

  const handleUpvote = async (ticketId: string) => {
    if (!appState) return;
    // Optimistic UI update
    const updatedTickets = appState.tickets.map(t => {
      if (t.id === ticketId && !t.upvotedUserIds.includes(appState.currentUser.id)) {
        return { ...t, upvotes: t.upvotes + 1, upvotedUserIds: [...t.upvotedUserIds, appState.currentUser.id] };
      }
      return t;
    });
    setAppState({ ...appState, tickets: updatedTickets });

    try {
      await fetch(`/api/tickets/${ticketId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appState.currentUser.id })
      });
    } catch (e) {
      console.error('Upvote failed:', e);
    }
  };

  const handleReply = async (ticketId: string, text: string) => {
    if (!appState) return;
    const author = appState.currentUser.role === 'admin' ? `${appState.currentUser.name} (Authority)` : appState.currentUser.name;
    const isAuthority = appState.currentUser.role === 'admin';

    const newReply = {
      id: `REP-${Date.now()}`,
      author,
      isAuthority,
      text,
      timestamp: 'Just now'
    };

    const updatedTickets = appState.tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, forumReplies: [...t.forumReplies, newReply] };
      }
      return t;
    });
    setAppState({ ...appState, tickets: updatedTickets });

    try {
      await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, isAuthority, text })
      });
    } catch (e) {
      console.error('Reply post failed:', e);
    }
  };

  const handleReopen = async (ticketId: string, reason: string) => {
    if (!appState) return;
    const updatedTickets = appState.tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'ongoing' as const,
          reopenFlags: t.reopenFlags + 1,
          transparencyLog: [
            ...t.transparencyLog,
            { step: `Reopened by Citizen: ${reason}`, timestamp: 'Just now', holderDesk: 'Field Inspector Desk Re-verification', active: true }
          ]
        };
      }
      return t;
    });
    setAppState({ ...appState, tickets: updatedTickets });

    try {
      await fetch(`/api/tickets/${ticketId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appState.currentUser.id, reason })
      });
    } catch (e) {
      console.error('Reopen failed:', e);
    }
  };

  const handleTriggerCron = async (forceSimulate = true) => {
    setIsSimulatingCron(true);
    try {
      const res = await fetch('/api/cron/check-accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSimulate })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Cron job completed. Eligible 30-day Green tickets transitioned to CLOSED.');
        if (appState) fetchGlobalState(appState.activePincode, appState.currentUser.role);
      }
    } catch (e) {
      console.error('Cron error:', e);
    } finally {
      setIsSimulatingCron(false);
    }
  };

  const handleWizardSubmitSuccess = (newTicket: Ticket) => {
    if (!appState) return;
    // Unshift new ticket to list
    setAppState({ ...appState, tickets: [newTicket, ...appState.tickets] });
    // Loop step: After Intake Wizard Form (Screen 2) -> Gemini AI Triage -> Admin Moderation Queue (Screen 3)
    alert('✅ Incident Submitted! Multi-Modal Gemini AI is cross-examining your report. Shifting to Screen 3 Admin Queue for moderation.');
    setActiveScreen(3);
  };

  const handleModerate = async (ticketId: string, action: 'accept' | 'reject', overrideData?: any) => {
    if (!appState) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...overrideData })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accept') {
          alert('✅ Ticket Verified and Accepted! Pushing instantly onto Screen 1 Neighborhood Map.');
          // Loop step: Admin Queue (Screen 3) -> Accepted ticket pushed to Screen 1 Map
          fetchGlobalState(appState.activePincode, appState.currentUser.role);
          setActiveScreen(1);
        } else {
          alert('❌ Ticket Rejected and isolated into 30-day backend audit folder.');
          fetchGlobalState(appState.activePincode, appState.currentUser.role);
        }
      }
    } catch (e) {
      console.error('Moderation failed:', e);
    }
  };

  const handleRsvpDrive = async (driveId: string, status: 'attending' | 'cannot_attend') => {
    if (!appState) return;
    const updatedDrives = appState.socialDrives.map(d => {
      if (d.id === driveId) {
        const existing = d.rsvps.find(r => r.userId === appState.currentUser.id);
        const newRsvps = existing
          ? d.rsvps.map(r => r.userId === appState.currentUser.id ? { ...r, status } : r)
          : [...d.rsvps, { userId: appState.currentUser.id, status }];
        return { ...d, rsvps: newRsvps };
      }
      return d;
    });
    setAppState({ ...appState, socialDrives: updatedDrives });

    try {
      await fetch(`/api/drives/${driveId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appState.currentUser.id, status })
      });
    } catch (e) {
      console.error('RSVP error:', e);
    }
  };

  const handleUploadDriveProof = async (driveId: string, photoUrl: string, userLat: number, userLng: number) => {
    if (!appState) return;

    try {
      const res = await fetch(`/api/drives/${driveId}/upload-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appState.currentUser.id,
          authorName: appState.currentUser.name,
          photoUrl,
          userLat,
          userLng
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ ${data.error}: ${data.message}`);
        return;
      }
      if (data.success) {
        alert('🎉 Geofenced Proof Verified! +50 XP committed to your Perpetual Civic Ledger.');
        fetchGlobalState(appState.activePincode, appState.currentUser.role);
      }
    } catch (e) {
      console.error('Upload proof failed:', e);
    }
  };

  const handleClaimReward = async () => {
    if (!appState) return;
    try {
      const res = await fetch(`/api/users/${appState.currentUser.id}/claim-reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎁 Serial Token Claimed Successfully: ${data.claimedToken}. Stored in your digital wallet ledger!`);
        fetchGlobalState(appState.activePincode, appState.currentUser.role);
      }
    } catch (e) {
      console.error('Claim error:', e);
    }
  };

  if (isLoading || !appState) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200 mb-4 animate-bounce">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Booting Community Hero Loop...</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Initializing 4-screen civic accountability radar, clustered map bounds, and Gemini AI multi-modal triage engine.
        </p>
      </div>
    );
  }

  const pendingCount = appState.tickets.filter(t => t.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-[#F1F3F6] text-[#1A1A1A] font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white pb-16">
      
      {/* 4-Screen Loop Navigation Header */}
      <NavigationHeader
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        currentUser={appState.currentUser}
        activePincode={appState.activePincode}
        onPincodeChange={handlePincodeChange}
        onRoleToggle={handleRoleToggle}
        pendingQueueCount={pendingCount}
        onRefresh={() => fetchGlobalState(appState.activePincode, appState.currentUser.role)}
        isSimulatingCron={isSimulatingCron}
        onTriggerCron={() => handleTriggerCron(true)}
      />

      {/* Dynamic Screen View Container */}
      <main className="flex-1 transition-all duration-300 pt-4">
        {activeScreen === 1 && (
          <Screen1HomeHub
            tickets={appState.tickets}
            activePincode={appState.activePincode}
            currentUser={appState.currentUser}
            onUpvote={handleUpvote}
            onReply={handleReply}
            onReopen={handleReopen}
            onTriggerCron={handleTriggerCron}
            onNavigateToWizard={() => setActiveScreen(2)}
          />
        )}

        {activeScreen === 2 && (
          <Screen2ReportWizard
            currentUser={appState.currentUser}
            activePincode={appState.activePincode}
            onSubmitSuccess={handleWizardSubmitSuccess}
            onCancelWizard={() => setActiveScreen(1)}
          />
        )}

        {activeScreen === 3 && (
          <Screen3AdminModeration
            tickets={appState.tickets}
            currentUser={appState.currentUser}
            onModerate={handleModerate}
            onSwitchToAdminRole={handleRoleToggle}
          />
        )}

        {activeScreen === 4 && (
          <Screen4CivicGuild
            currentUser={appState.currentUser}
            activePincode={appState.activePincode}
            crowdfundWallet={appState.crowdfundWallet}
            socialDrives={appState.socialDrives}
            leaderboard={appState.leaderboard}
            onClaimReward={handleClaimReward}
            onRsvpDrive={handleRsvpDrive}
            onUploadDriveProof={handleUploadDriveProof}
          />
        )}
      </main>

      {/* Footer info banner */}
      <footer className="max-w-7xl mx-auto px-6 pt-8 pb-4 text-center text-[11px] text-gray-400 font-mono flex flex-col md:flex-row items-center justify-between gap-2 border-t border-gray-200/80 mt-12 w-full">
        <span>🏛️ Community Hero Civic Platform • Clean Utility Architecture</span>
        <span>4-Screen Loop: Hub Map ➔ Intake Wizard ➔ Gemini AI Triage ➔ Admin Queue ➔ Civic Guild</span>
      </footer>

    </div>
  );
}
