import React, { useState } from 'react';
import { CrowdfundWallet, SocialDrive, UserProfile } from '../types';
import { Award, Trophy, ShieldCheck, DollarSign, FileText, Calendar, MapPin, CheckCircle2, XCircle, Camera, Upload, ChevronRight, Zap, Users } from 'lucide-react';

interface Screen4CivicGuildProps {
  currentUser: UserProfile;
  activePincode: string;
  crowdfundWallet: CrowdfundWallet;
  socialDrives: SocialDrive[];
  leaderboard: any[];
  onClaimReward: () => void;
  onRsvpDrive: (driveId: string, status: 'attending' | 'cannot_attend') => void;
  onUploadDriveProof: (driveId: string, photoUrl: string, userLat: number, userLng: number) => void;
}

export const Screen4CivicGuild: React.FC<Screen4CivicGuildProps> = ({
  currentUser,
  activePincode,
  crowdfundWallet,
  socialDrives,
  leaderboard,
  onClaimReward,
  onRsvpDrive,
  onUploadDriveProof
}) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeDriveProof, setActiveDriveProof] = useState<string | null>(null);
  const [proofLat, setProofLat] = useState(28.6139);
  const [proofLng, setProofLng] = useState(77.2090);
  const [isSimulatingOutsideGeofence, setIsSimulatingOutsideGeofence] = useState(false);

  // Time-Independent Perpetual Progression Equation
  const calculatedTotalScore = (currentUser.cumulativeXP + currentUser.verifiedVotesReceived) - currentUser.negativePenalties;
  const prevMilestoneBase = currentUser.nextMilestone - 3000;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((calculatedTotalScore - prevMilestoneBase) / 3000) * 100)));

  const handleUploadClick = (driveId: string) => {
    if (!activeDriveProof) {
      alert('Please select a photo file first.');
      return;
    }
    // If simulating outside geofence, pass shifted coords (+500 meters away)
    const lat = isSimulatingOutsideGeofence ? 28.6500 : 28.6139;
    const lng = isSimulatingOutsideGeofence ? 77.2500 : 77.2090;

    onUploadDriveProof(driveId, activeDriveProof, lat, lng);
    setActiveDriveProof(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Container adhering to Clean Utility theme layout structure */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        {/* SECTION 1: MILESTONE PROGRESS TRACKER HEADER (Perpetual Progression Logic) */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 md:p-8 rounded-t-3xl text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-black/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                  Perpetual Civic Ledger (Time-Independent)
                </span>
                <span className="text-[10px] font-bold uppercase opacity-80">No Calendar Resets</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">Active Civic Tier: Gold Guardian</p>
              <h3 className="text-4xl font-bold font-mono tracking-tight flex items-baseline gap-2">
                {calculatedTotalScore.toLocaleString()} <span className="text-sm font-sans font-normal opacity-75">Verified Score</span>
              </h3>
              <p className="text-[11px] font-mono text-emerald-100 mt-1">
                Equation: ({currentUser.cumulativeXP} XP + {currentUser.verifiedVotesReceived} Votes) - {currentUser.negativePenalties} Penalties
              </p>
            </div>

            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
              <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center text-2xl animate-bounce">
                🏆
              </div>
            </div>
          </div>

          {/* Un-Timed Visual Completion Bar */}
          <div className="mt-6 relative z-10">
            <div className="flex justify-between items-center text-xs font-bold uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <span>Next Reward Threshold Goal</span>
                <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{currentUser.nextMilestone} XP</span>
              </span>
              <span className="font-mono text-sm">{progressPercent}%</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* CLAIMABLE DIGITAL SERIAL VOUCHER TOKEN */}
          {currentUser.isRewardAvailable && currentUser.pendingVoucher && (
            <div className="mt-5 p-4 bg-yellow-400 text-gray-950 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-scale-in border-2 border-white">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-gray-900 fill-gray-900 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-800 font-mono">🎉 Hard-Coded Milestone Crossed!</span>
                  <p className="text-xs font-bold">Voucher Token Released: <span className="font-mono bg-black/10 px-1.5 py-0.5 rounded">{currentUser.pendingVoucher}</span></p>
                </div>
              </div>
              <button
                onClick={onClaimReward}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-950 hover:bg-gray-800 text-yellow-300 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                🎁 CLAIM SERIAL CODE TOKEN NOW
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: GUILD HUB MAIN CONTENT GRID */}
        <div className="p-6 md:p-8 space-y-8 bg-white">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ANONYMIZED LOCAL LEADERBOARD (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Local Area Leaderboard ({activePincode})
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  🔒 Masked Profiles
                </span>
              </div>
              <p className="text-xs text-gray-500">
                To protect citizen privacy and physical safety, legal identities are strictly anonymized with custom abstract user aliases.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {leaderboard.map((item, idx) => {
                  const isUser = item.userId === currentUser.id || item.maskedName.includes('You');
                  return (
                    <div
                      key={item.userId || idx}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                        isUser
                          ? 'bg-blue-50/80 border-2 border-blue-500/40 shadow-sm'
                          : 'hover:bg-[#F1F3F6] border border-gray-100'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-amber-50 text-amber-800' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.rank || idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1A1A1A] truncate">{item.maskedName}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{item.badge}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-600 block">{item.score.toLocaleString()} XP</span>
                        {isUser && <span className="text-[9px] font-bold uppercase text-blue-600 tracking-tighter">Your Account</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Claimed Wallets list */}
              {currentUser.rewardsClaimed.length > 0 && (
                <div className="p-4 bg-[#F1F3F6] rounded-2xl border border-gray-200 mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-500 font-mono block">🎟️ Your Claimed Digital Serial Tokens:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.rewardsClaimed.map((tok, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-gray-300 text-gray-800 shadow-2xs">
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: CROWDFUND WALLET LEDGER WIDGET (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Neighborhood Wallet Ledger
                </h4>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  PIN: {crowdfundWallet.pincode}
                </span>
              </div>

              <div className="p-6 bg-[#F1F3F6] rounded-3xl border border-gray-200/80 space-y-5 relative">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider font-mono block">Micro-Project Fund</span>
                  <h5 className="text-base font-bold text-[#1A1A1A] mt-1 leading-snug">{crowdfundWallet.projectName}</h5>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block font-mono">Amount Raised</span>
                    <span className="text-2xl font-bold font-mono text-emerald-600">₹{crowdfundWallet.amountRaised.toLocaleString()}</span>
                  </div>
                  <div className="border-l border-gray-100 pl-4">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block font-mono">Target Funding Goal</span>
                    <span className="text-2xl font-bold font-mono text-gray-900">₹{crowdfundWallet.targetGoal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                    <span>Funding Progress</span>
                    <span className="font-mono">{Math.round((crowdfundWallet.amountRaised / crowdfundWallet.targetGoal) * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${(crowdfundWallet.amountRaised / crowdfundWallet.targetGoal) * 100}%` }}></div>
                  </div>
                </div>

                {/* External Data Log Routing Link Button */}
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-[#1A1A1A] shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>VIEW EXPENDITURE PROOFS & STORE RECEIPTS ({crowdfundWallet.receiptLogs.length})</span>
                </button>
              </div>
            </div>

          </div>

          {/* SECTION 3: NOTICE BOARD & RSVP SOCIAL DRIVE FEED */}
          <div className="pt-6 border-t border-gray-200 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Notice Board & Local Social Drive Wall
                </h4>
                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">Physical Safety & Cleanliness RSVP Feeds</p>
              </div>
              <span className="text-xs text-gray-400 font-mono">Radius Geofence Enforcement Active</span>
            </div>

            {socialDrives.map(drive => {
              const myRsvp = drive.rsvps.find(r => r.userId === currentUser.id)?.status;
              const attendingCount = drive.rsvps.filter(r => r.status === 'attending').length;

              return (
                <div key={drive.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono text-[10px] font-bold rounded-md uppercase">
                        📍 COMMUNITY DRIVE: {drive.pincode}
                      </span>
                      <h5 className="text-xl font-bold text-[#1A1A1A] mt-2">{drive.title}</h5>
                      <p className="text-xs text-gray-500 mt-1">{drive.description}</p>
                    </div>

                    <div className="bg-[#F1F3F6] p-3.5 rounded-2xl border border-gray-200 text-xs font-medium space-y-1 shrink-0">
                      <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" /> <strong>{drive.date}</strong></p>
                      <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>{drive.locationName}</span></p>
                      <p className="text-[10px] font-mono text-gray-400 pt-1">🌐 Geo-fence Target Radius: {drive.geofenceRadiusMeters}m</p>
                    </div>
                  </div>

                  {/* INTERACTIVE POLL RSVP COMPONENT */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-blue-950 block">Your RSVP Status: {myRsvp ? myRsvp.toUpperCase() : 'PENDING'}</span>
                      <span className="text-[11px] text-gray-500">Attending civic drives yields direct reputation community honor.</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onRsvpDrive(drive.id, 'attending')}
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          myRsvp === 'attending' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Attending ({attendingCount})</span>
                      </button>

                      <button
                        onClick={() => onRsvpDrive(drive.id, 'cannot_attend')}
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          myRsvp === 'cannot_attend' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Cannot Attend</span>
                      </button>
                    </div>
                  </div>

                  {/* EVENT WALL & GEO-FENCED COORDINATES MATCHING LOOP */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 font-mono">
                        <Camera className="w-4 h-4 text-blue-600" />
                        Execution Photo Proof Wall ({drive.executionPhotos.length})
                      </span>

                      {/* Simulation Geofence Checkbox */}
                      <label className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 cursor-pointer flex items-center gap-1.5 select-none">
                        <input
                          type="checkbox"
                          checked={isSimulatingOutsideGeofence}
                          onChange={(e) => setIsSimulatingOutsideGeofence(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span>Simulate GPS Outside Geofence (+500m breach check)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Photo Upload Card */}
                      <div className="bg-[#F1F3F6] p-4 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col justify-between gap-3">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Post Action Shot (+50 XP)</span>
                        
                        <input
                          type="text"
                          placeholder="Image URL (e.g. unsplash link)..."
                          value={activeDriveProof || ''}
                          onChange={(e) => setActiveDriveProof(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                        />

                        {!activeDriveProof && (
                          <button
                            type="button"
                            onClick={() => setActiveDriveProof('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80')}
                            className="text-[10px] text-blue-600 font-bold text-left underline"
                          >
                            Paste Sample Cleanup Photo
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleUploadClick(drive.id)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Geofenced Shot</span>
                        </button>
                      </div>

                      {/* Display active execution photos */}
                      {drive.executionPhotos.map(photo => (
                        <div key={photo.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
                          <img src={photo.photoUrl} alt="Execution Proof" className="w-full h-32 object-cover" />
                          <div className="p-3 bg-gray-50 flex-1 flex flex-col justify-between">
                            <span className="text-xs font-bold text-[#1A1A1A]">{photo.authorName}</span>
                            <span className="text-[9px] font-mono text-emerald-600 font-bold">📍 Coords Verified within Geofence</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* --- EXTERNAL RECEIPT LOG MODAL --- */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-gray-200 shadow-2xl space-y-6 animate-slide-up max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-2 text-emerald-700">
                <FileText className="w-6 h-6" />
                <h3 className="text-lg font-bold">Neighborhood Expenditure Proofs & Store Receipts</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-sm">✕</button>
            </div>

            <p className="text-xs text-gray-500 shrink-0">
              Immutable ledger log for civic micro-project: <strong className="text-gray-900">{crowdfundWallet.projectName}</strong>. Total Disbursed: <strong className="font-mono text-emerald-600">₹{crowdfundWallet.amountRaised.toLocaleString()}</strong>.
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {crowdfundWallet.receiptLogs.map(rec => (
                <div key={rec.id} className="p-4 rounded-2xl bg-[#F1F3F6] border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-start gap-3.5">
                    <img src={rec.receiptUrl} alt="Store Receipt" className="w-16 h-16 object-cover rounded-xl border border-gray-300 shadow-2xs" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400">{rec.id} • {rec.date}</span>
                      <h6 className="text-sm font-bold text-[#1A1A1A]">{rec.vendor}</h6>
                      <p className="text-xs text-gray-600 mt-0.5">{rec.description}</p>
                    </div>
                  </div>
                  <div className="bg-white px-3.5 py-2 rounded-xl border border-gray-200 font-mono font-bold text-sm text-emerald-600 shrink-0 self-end md:self-auto">
                    ₹{rec.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
              >
                Close Receipts Ledger
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
