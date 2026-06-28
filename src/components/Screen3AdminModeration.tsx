import React, { useState } from 'react';
import { Ticket, UserProfile } from '../types';
import { ShieldAlert, CheckCircle, XCircle, Edit3, Save, AlertOctagon, Brain, User, Hash, Lock, Check } from 'lucide-react';

interface Screen3AdminModerationProps {
  tickets: Ticket[];
  currentUser: UserProfile;
  onModerate: (ticketId: string, action: 'accept' | 'reject', overrideData?: any) => void;
  onSwitchToAdminRole: () => void;
}

export const Screen3AdminModeration: React.FC<Screen3AdminModerationProps> = ({
  tickets,
  currentUser,
  onModerate,
  onSwitchToAdminRole
}) => {
  // Filter for pending tickets (submitted state)
  const pendingQueue = tickets.filter(t => t.status === 'submitted');

  // Override Editing State per ticket
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [overrideCat, setOverrideCat] = useState('');
  const [overrideUrgency, setOverrideUrgency] = useState(6);
  const [adminNotes, setAdminNotes] = useState('');

  // Rejection Modal State
  const [rejectingTicket, setRejectingTicket] = useState<Ticket | null>(null);
  const [rejectionRationale, setRejectionRationale] = useState('Spam');

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-3xl border border-gray-200 shadow-sm mt-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Admin Moderation Clearance Required</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Screen 3 is strictly restricted to authorized human civic administrators to verify AI multi-modal intake evaluations and prevent fraud point generation.
        </p>
        <button
          onClick={onSwitchToAdminRole}
          className="px-6 py-3 bg-[#0F1115] hover:bg-gray-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
        >
          🔐 Switch Role to Officer Admin Queue
        </button>
      </div>
    );
  }

  const handleStartEdit = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    setOverrideCat(ticket.verifiedCategory || ticket.category);
    setOverrideUrgency(ticket.urgencyScore || 5);
    setAdminNotes(ticket.adminNotes || '');
  };

  const handleSaveEdit = (ticketId: string) => {
    setEditingTicketId(null);
  };

  const handleAcceptClick = (ticket: Ticket) => {
    const overridePayload = {
      overriddenCategory: overrideCat || ticket.verifiedCategory,
      overriddenUrgency: overrideUrgency || ticket.urgencyScore,
      adminNotes
    };
    onModerate(ticket.id, 'accept', overridePayload);
    setEditingTicketId(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTicket) return;
    onModerate(rejectingTicket.id, 'reject', { rejectionRationale });
    setRejectingTicket(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Container adhering strictly to Clean Utility dark screen styling */}
      <div className="bg-[#0F1115] rounded-3xl shadow-sm flex flex-col text-white p-6 md:p-8 space-y-6 border border-white/5">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Screen 3: Admin Triage & Moderation Queue</h2>
            <p className="text-sm font-bold text-white mt-0.5">
              Pending Verification Ingestion Queue: <span className="text-amber-400 font-mono">{pendingQueue.length} Ticket(s)</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-mono font-bold rounded border border-red-500/30 uppercase animate-pulse">
            Priority Alpha Desk
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-gray-200">Ingestion Queue Clean</h3>
            <p className="text-xs text-gray-500">All submitted tickets have been moderated and pushed onto Screen 1's public radar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingQueue.map(ticket => {
              const isEditing = editingTicketId === ticket.id;

              return (
                <div key={ticket.id} className="bg-gray-800/50 rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col gap-6 shadow-inner">
                  
                  {/* Top Bar ID & Citizen Info */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-gray-400 font-bold">
                      <Hash className="w-4 h-4 text-blue-400" />
                      <span>{ticket.id}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-300">{ticket.isAnonymous ? 'Anonymous Submitter (Protected ID)' : ticket.citizenName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString() : 'Just now'}</span>
                  </div>

                  {/* SPLIT VIEW CARD: Citizen Raw Data vs Gemini AI Output */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* LEFT: Citizen Raw Submitted Data */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-400" />
                            Citizen Raw Submitted Data
                          </p>
                          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                            {ticket.category}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-800 rounded-xl text-xs leading-relaxed border border-white/5 space-y-3">
                          <p className="text-gray-200 font-medium">"{ticket.description}"</p>
                          <p className="text-[11px] text-gray-400 font-mono">📍 {ticket.locationName}</p>
                          {ticket.isUnverifiedLocation && (
                            <span className="inline-block text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                              Unverified Device GPS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <img src={ticket.mediaUrl} alt="Submitted Evidence" className="w-full h-40 object-cover rounded-xl border border-white/10 shadow-sm" />
                      </div>
                    </div>

                    {/* RIGHT: Gemini AI Analysis JSON & Manual Override Safety Net */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <Brain className="w-3 h-3 text-indigo-400" />
                            Gemini AI Multi-Modal Triage Analysis
                          </p>
                          
                          {/* MANUAL OVERRIDE INPUT BUTTON (✏️) */}
                          {!isEditing ? (
                            <button
                              onClick={() => handleStartEdit(ticket)}
                              className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-indigo-500/30 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>✏️ Manual Override</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveEdit(ticket.id)}
                              className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Lock Edit</span>
                            </button>
                          )}
                        </div>

                        {/* AI Evaluation Box or Editable Safety Net */}
                        {!isEditing ? (
                          <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/20 space-y-3">
                            <div className="flex justify-between items-center font-mono">
                              <span className="text-xs text-indigo-300">Verified Category:</span>
                              <span className="text-xs font-bold text-white bg-indigo-600 px-2 py-0.5 rounded">{ticket.verifiedCategory || ticket.category}</span>
                            </div>
                            <div className="flex justify-between items-center font-mono">
                              <span className="text-xs text-indigo-300">Urgency Score (1-10):</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${ticket.urgencyScore >= 8 ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
                                {ticket.urgencyScore}/10
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 italic border-t border-indigo-500/20 pt-2">
                              💡 AI Reasoning: {ticket.aiReasoning}
                            </p>
                          </div>
                        ) : (
                          /* MANUAL OVERRIDE INPUT FORM */
                          <div className="p-4 bg-indigo-900/50 rounded-xl border-2 border-indigo-400 space-y-3">
                            <span className="text-[10px] font-bold uppercase text-amber-300 block font-mono">✏️ Administrator Override Safety Net</span>
                            
                            <div>
                              <label className="text-[10px] text-gray-300 block">Override Category Choice:</label>
                              <select
                                value={overrideCat}
                                onChange={(e) => setOverrideCat(e.target.value)}
                                className="w-full mt-1 bg-gray-900 border border-indigo-400 rounded-lg p-2 text-xs font-bold text-white focus:outline-none"
                              >
                                <option value="Damaged Streetlights">Damaged Streetlights</option>
                                <option value="Water Leakage">Water Leakage</option>
                                <option value="Potholes">Potholes</option>
                                <option value="Waste Management">Waste Management</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-300 block">Override Urgency Rating ({overrideUrgency}/10):</label>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={overrideUrgency}
                                onChange={(e) => setOverrideUrgency(parseInt(e.target.value))}
                                className="w-full accent-indigo-400"
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Admin override note (optional)..."
                                className="w-full bg-gray-900 border border-white/20 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clean JSON Output Box matching HTML template */}
                      <div className="bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-green-400 overflow-x-auto select-all">
                        {`{ "verifiedCategory": "${overrideCat || ticket.verifiedCategory || ticket.category}", "urgencyScore": ${overrideUrgency || ticket.urgencyScore}, "aiReasoning": "${ticket.aiReasoning.substring(0, 50)}..." }`}
                      </div>
                    </div>

                  </div>

                  {/* ACCOUNTABILITY FOOTER CONTROLS */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                    
                    {/* [❌ REJECT / DISCARD] */}
                    <button
                      type="button"
                      onClick={() => setRejectingTicket(ticket)}
                      className="flex-1 py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>❌ REJECT / DISCARD</span>
                    </button>

                    {/* [✅ ACCEPT TO FEED] */}
                    <button
                      type="button"
                      onClick={() => handleAcceptClick(ticket)}
                      className="flex-[2] py-3.5 px-4 bg-green-500 hover:bg-green-400 text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 fill-black text-green-500" />
                      <span>✅ ACCEPT TO FEED</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- POPUP MODAL FOR REJECTION RATIONALE --- */}
      {rejectingTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1115] text-white rounded-3xl max-w-md w-full p-6 border border-red-500/40 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center gap-3 text-red-400 border-b border-white/10 pb-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold uppercase tracking-wider font-mono">Structured Rejection Rationale</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              You are isolating ticket <span className="font-mono text-amber-400">{rejectingTicket.id}</span> into the 30-day backend audit folder before permanent deletion. This will push a rejection notice to the citizen.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2 font-mono">Select Mandatory Rationale:</label>
                <select
                  value={rejectionRationale}
                  onChange={(e) => setRejectionRationale(e.target.value)}
                  className="w-full bg-gray-900 border border-white/20 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Spam / Prank Submission">🚫 Spam / Prank Submission</option>
                  <option value="Duplicate Ticket Already Active">📑 Duplicate Ticket Already Active</option>
                  <option value="Insufficient Photographic Proof">📷 Insufficient Photographic Proof</option>
                  <option value="Outside Municipal Jurisdiction">🌐 Outside Municipal Jurisdiction</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTicket(null)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
