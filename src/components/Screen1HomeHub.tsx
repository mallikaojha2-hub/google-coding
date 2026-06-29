import React, { useState } from 'react';
import { Ticket, UserProfile } from '../types';
import { MapPin, ThumbsUp, AlertCircle, Clock, CheckCircle2, ChevronUp, MessageSquare, Send, ShieldCheck, Play, HelpCircle, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface Screen1HomeHubProps {
  tickets: Ticket[];
  activePincode: string;
  currentUser: UserProfile;
  onUpvote: (ticketId: string) => void;
  onReply: (ticketId: string, text: string) => void;
  onReopen: (ticketId: string, reason: string) => void;
  onTriggerCron: (forceSimulate?: boolean) => void;
  onNavigateToWizard: () => void;
}

export const Screen1HomeHub: React.FC<Screen1HomeHubProps> = ({
  tickets,
  activePincode,
  currentUser,
  onUpvote,
  onReply,
  onReopen,
  onTriggerCron,
  onNavigateToWizard
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showCronModal, setShowCronModal] = useState(false);
  const [entriesModalTicket, setEntriesModalTicket] = useState<Ticket | null>(null);
  const [entriesPage, setEntriesPage] = useState<number>(1);

  // Keep selected ticket synced with live prop updates
  const activeTicket = selectedTicket ? tickets.find(t => t.id === selectedTicket.id) || selectedTicket : null;

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'submitted': return { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: '🔴 New / Submitted' };
      case 'under_review': return { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '🟡 Under Review' };
      case 'ongoing': return { dot: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: '🔵 Ongoing Work' };
      case 'fixed': return { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: '🟢 Fixed & Monitoring' };
      case 'closed': return { dot: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', label: '⚫ Permanently Closed' };
      case 'rejected': return { dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', label: '🟣 Rejected / Audit' };
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    onReply(activeTicket.id, replyText);
    setReplyText('');
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    const reason = reopenReason || 'Citizen flagged incomplete repair';
    onReopen(activeTicket.id, reason);
    setReopenReason('');
    alert('Ticket reopened and returned to Field Operations for verification.');
  };

  // Calculate days remaining on 30-day timer for green tickets
  const getDaysRemaining = (fixedAt?: string) => {
    if (!fixedAt) return 30;
    const elapsed = (Date.now() - new Date(fixedAt).getTime()) / (1000 * 3600 * 24);
    return Math.max(0, Math.round(30 - elapsed));
  };

  const getEstimatedCompletionDate = (ticket: Ticket) => {
    const baseDays = {
      'Potholes': 7,
      'Water Leakage': 3,
      'Damaged Streetlights': 2,
      'Waste Management': 1
    }[ticket.category] || 4;

    let factor = 1.0;
    if (ticket.milestoneProgress === 1) factor = 0.5;
    if (ticket.milestoneProgress === 2) factor = 0.2;

    const remainingDays = Math.max(1, Math.round(baseDays * factor));
    const start = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
    const estDate = new Date(start.getTime() + remainingDays * 24 * 60 * 60 * 1000);
    
    return estDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRemainingDaysText = (ticket: Ticket) => {
    const baseDays = {
      'Potholes': 7,
      'Water Leakage': 3,
      'Damaged Streetlights': 2,
      'Waste Management': 1
    }[ticket.category] || 4;

    let factor = 1.0;
    if (ticket.milestoneProgress === 1) factor = 0.5;
    if (ticket.milestoneProgress === 2) factor = 0.2;

    const remainingDays = Math.max(1, Math.round(baseDays * factor));
    return `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} remaining`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-mono text-[11px] font-bold rounded-lg uppercase tracking-wider">
              PINCODE BOUNDARY BOX: {activePincode}
            </span>
            <span className="text-xs text-gray-400 font-bold">• {tickets.length} Active Tickets</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Neighborhood Hub Map & Live Feed</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time civic transparency radar. Zoom in to expand clustered markers.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCronModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-200"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Automated Cron Logic</span>
          </button>
          
          <button
            onClick={onNavigateToWizard}
            className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <span>+ Report Incident</span>
          </button>
        </div>
      </div>

      {/* Main Map & Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Column (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[520px] relative">
          
          {/* Map Header Controls */}
          <div className="p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md z-20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600 animate-spin-slow" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Geographic Radar Layer</span>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setIsZoomedIn(false)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${!isZoomedIn ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                <ZoomOut className="w-3 h-3" /> Clustered View
              </button>
              <button
                onClick={() => setIsZoomedIn(true)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isZoomedIn ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                <ZoomIn className="w-3 h-3" /> Individual Pins
              </button>
            </div>
          </div>

          {/* Interactive Simulated Map Canvas */}
          <div className="flex-1 bg-[#E3E8ED] relative overflow-hidden flex items-center justify-center select-none">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Road lines simulation */}
            <div className="absolute inset-x-0 top-1/3 h-12 bg-white/40 border-y border-gray-400/20 transform -rotate-6"></div>
            <div className="absolute inset-y-0 left-1/2 w-16 bg-white/40 border-x border-gray-400/20 transform rotate-12"></div>

            {/* CLUSTERED NUMERIC BUBBLE (When Zoomed Out) */}
            {!isZoomedIn ? (
              <div
                onClick={() => setIsZoomedIn(true)}
                className="cursor-pointer group relative z-10 animate-bounce"
              >
                <div className="w-20 h-20 rounded-full bg-blue-600/20 border-4 border-blue-600 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold font-mono text-blue-700 leading-none">{tickets.length}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-blue-800">Reports</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  Click to Expand Cluster
                </div>
              </div>
            ) : (
              /* INDIVIDUAL COLOR-CODED PINS (When Zoomed In) */
              <div className="absolute inset-0 w-full h-full p-8">
                {tickets.map((ticket, idx) => {
                  const style = getStatusColor(ticket.status);
                  const isSelected = activeTicket?.id === ticket.id;
                  // Distribute pseudo pins across the box
                  const topPositions = ['20%', '65%', '40%', '80%', '30%'];
                  const leftPositions = ['25%', '70%', '45%', '20%', '80%'];

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{ top: topPositions[idx % 5], left: leftPositions[idx % 5] }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-10 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                    >
                      <div className="relative flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-2xl ${style.dot} border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="absolute top-9 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-40 animate-fade-in">
                            {ticket.id}: {ticket.title.substring(0, 15)}...
                          </div>
                        )}
                        <div className={`w-3 h-1.5 bg-black/20 rounded-full mt-0.5 blur-[1px]`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-around gap-2 text-[10px] font-bold text-gray-700 shadow-sm z-20">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 🔴 New (Red)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> 🟡 Review (Yellow)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 🔵 Ongoing (Blue)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 🟢 Fixed (Green)</div>
            </div>
          </div>
        </div>

        {/* Dynamic List Feed Column (5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pincode Feed List ({tickets.length})</h3>
            <span className="text-[10px] font-bold text-blue-600">Sorted by Upvotes ▲</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {tickets.map(ticket => {
              const style = getStatusColor(ticket.status);
              const isSelected = activeTicket?.id === ticket.id;
              const isUpvoted = ticket.upvotedUserIds.includes(currentUser.id);

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col gap-3 ${
                    isSelected ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-gray-400">{ticket.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{ticket.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{ticket.locationName}</span>
                      </p>
                    </div>

                    {/* Upvote Count Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onUpvote(ticket.id); }}
                      className={`px-3 py-2 rounded-xl flex flex-col items-center justify-center transition-all shrink-0 ${
                        isUpvoted ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200' : 'bg-[#F1F3F6] hover:bg-gray-200 text-[#1A1A1A]'
                      }`}
                    >
                      <ChevronUp className={`w-4 h-4 ${isUpvoted ? 'text-white' : 'text-blue-600'}`} />
                      <span className="text-xs font-mono font-bold leading-none mt-0.5">{ticket.upvotes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* --- SECTION 1 INTERACTIVE CONTEXTUAL BOTTOM SHEET DRAWER --- */}
      {activeTicket && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 space-y-6 animate-slide-up relative overflow-hidden">
          
          {/* Drawer Handle & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  DRAWER FOR TICKET: {activeTicket.id}
                </span>
                <span className="text-xs text-gray-400">• Reported by {activeTicket.isAnonymous ? 'Anonymous Citizen' : activeTicket.citizenName}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mt-1">{activeTicket.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{activeTicket.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase flex items-center gap-1.5 ${getStatusColor(activeTicket.status).bg} ${getStatusColor(activeTicket.status).text} ${getStatusColor(activeTicket.status).border}`}>
                <span>{getStatusColor(activeTicket.status).label}</span>
              </div>
            </div>
          </div>

          {/* --- CASE A: STATE IS 🔴 RED or 🟡 YELLOW --- */}
          {(activeTicket.status === 'submitted' || activeTicket.status === 'under_review') && (
            <div className="bg-[#F1F3F6] rounded-2xl p-5 border border-gray-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Transparency Log: Official Desk Custody Chain</span>
              </div>
              <p className="text-xs text-gray-500">Tracking the exact desk or department currently accountable for intake triage.</p>

              {/* Vertical Stepper Timeline */}
              <div className="space-y-4 pt-2 pl-2">
                {activeTicket.transparencyLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < activeTicket.transparencyLog.length - 1 && (
                      <div className="absolute left-3.5 top-7 w-0.5 h-8 bg-blue-400"></div>
                    )}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${log.active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-300 text-gray-600'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 flex-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1A1A1A]">{log.step}</span>
                        <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-mono text-blue-600 font-bold mt-1">
                        🏛️ HOLDING DESK: {log.holderDesk}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- CASE B: STATE IS 🔵 BLUE (ONGOING WORK) --- */}
          {activeTicket.status === 'ongoing' && (
            <div className="space-y-6">
              
              {/* 3-Step Milestone Progress Stepper */}
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-200 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Field Continuity Stepper</span>
                  <span className="text-xs font-mono font-bold text-blue-600">Phase {activeTicket.milestoneProgress + 1} of 3</span>
                </div>

                <div className="flex items-center justify-between relative px-4">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-blue-200 -z-0"></div>
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-0 transition-all duration-500" style={{ width: `${activeTicket.milestoneProgress * 50}%` }}></div>

                  {['1. Excavation', '2. Progress / Repair', '3. Surface Completion'].map((label, stepIdx) => {
                    const isCompleted = activeTicket.milestoneProgress >= stepIdx;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? '✓' : stepIdx + 1}
                        </div>
                        <span className={`text-[11px] font-bold ${isCompleted ? 'text-blue-900' : 'text-gray-400'}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Estimated Completion Section */}
                <div id="estimated-completion-container" className="pt-4 border-t border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-gray-500 font-medium">Estimated Completion: </span>
                      <strong className="text-blue-900 font-bold">{getEstimatedCompletionDate(activeTicket)}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full uppercase border border-emerald-200">
                      On Track
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      ({getRemainingDaysText(activeTicket)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Field Photo Continuity Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F1F3F6] p-4 rounded-2xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">Original Citizen Grievance Photo</span>
                  <img src={activeTicket.mediaUrl} alt="Grievance" className="w-full h-44 object-cover rounded-xl shadow-sm" />
                </div>

                <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-2">Latest Field Continuity Photo (Authority Upload)</span>
                  {activeTicket.fieldPhotoUrl ? (
                    <img src={activeTicket.fieldPhotoUrl} alt="Field Continuity" className="w-full h-44 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <div className="w-full h-44 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-xs text-blue-500 font-bold bg-white/50">
                      Awaiting Field Crew Live Photo...
                    </div>
                  )}
                </div>
              </div>

              {/* Nested Two-Tiered Citizen-to-Authority Reply Panel */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Public Grievance Forum & Authority Dialogue ({activeTicket.forumReplies.length})</span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {activeTicket.forumReplies.map(reply => (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs flex flex-col gap-1 ${
                        reply.isAuthority
                          ? 'bg-blue-600 text-white self-start shadow-md shadow-blue-100 rounded-tl-none'
                          : 'bg-[#F1F3F6] text-[#1A1A1A] ml-auto rounded-tr-none border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <span className="font-bold flex items-center gap-1">
                          {reply.isAuthority && <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />}
                          {reply.author}
                        </span>
                        <span className={`text-[9px] font-mono ${reply.isAuthority ? 'text-blue-200' : 'text-gray-400'}`}>{reply.timestamp}</span>
                      </div>
                      <p className="leading-relaxed mt-0.5">{reply.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write inquiry or update for field crew..."
                    className="flex-1 bg-[#F1F3F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* --- CASE C: STATE IS 🟢 GREEN (FIXED & 30-DAY TIMER) --- */}
          {activeTicket.status === 'fixed' && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-300 space-y-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                      Civic Warranty Active
                    </span>
                    <h4 className="text-lg font-bold text-emerald-950 mt-1">
                      30-Day Public Accountability Timer
                    </h4>
                  </div>
                </div>

                <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-200 shadow-sm text-center">
                  <span className="text-2xl font-mono font-bold text-emerald-600 block leading-none">
                    {getDaysRemaining(activeTicket.fixedAt)} Days
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Remaining before Auto-Close</span>
                </div>
              </div>

              <p className="text-xs text-emerald-900 leading-relaxed">
                The contractor has marked this issue as repaired. The community now holds a mandatory 30-day window to inspect quality. If the pothole re-opens or leakage resumes, reopen immediately without bureaucracy.
              </p>

              {/* Two Actionable Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => alert('Solid fix confirmed! Thank you for maintaining community accountability.')}
                  className="py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>👍 Fix is Solid (Vouch Quality)</span>
                </button>

                <form onSubmit={handleReopenSubmit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Reason if reopening (e.g. pipe leaking again)..."
                    className="bg-white border border-red-200 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-red-200 transition-all"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>👎 Reopen Ticket (Flag Defect)</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      )}

      {/* --- SYSTEM AUTOMATED CRON-JOB LOGIC MODAL & PSEUDO-CODE --- */}
      {showCronModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1115] text-white rounded-3xl max-w-3xl w-full p-6 border border-white/10 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold uppercase tracking-wider font-mono">System Automated Cron-Job Logic</h3>
              </div>
              <button onClick={() => setShowCronModal(false)} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <p className="text-xs text-gray-300">
              Below is the backend architecture pseudo-code script executed daily at 00:00 UTC to evaluate all tickets currently residing in the 🟢 Green (Fixed) monitoring window.
            </p>

            {/* Backend Script Code Block */}
            <div className="bg-black/60 rounded-2xl p-4 border border-white/5 font-mono text-[11px] text-green-400 overflow-x-auto leading-relaxed shadow-inner">
              <pre>{`/**
 * @cron Daily at 00:00 UTC (0 0 * * *)
 * @description Evaluates 30-Day Citizen Monitoring Window
 */
async function executeDailyAccountabilityCron() {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 1. Query all tickets in 'fixed' (Green) status
  const greenTickets = await db.tickets.findMany({
    where: { status: 'fixed' }
  });

  for (const ticket of greenTickets) {
    const elapsed = now - new Date(ticket.fixedAt).getTime();

    // 2. Check if 30 days have passed WITHOUT citizen reopen flags
    if (elapsed >= thirtyDaysMs && ticket.reopenFlags === 0) {
      
      // 3. Automatically flip permanently to final 'Closed' state
      await db.tickets.update({
        where: { id: ticket.id },
        data: {
          status: 'closed',
          closedAt: new Date().toISOString()
        }
      });

      await logAuditTrail(ticket.id, "Auto-Closed after 30-Day citizen silence.");
    }
  }
}`}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-gray-400">Pressing below simulates this daily server cron job on the active dataset:</span>
              <button
                onClick={() => { onTriggerCron(true); setShowCronModal(false); }}
                className="px-6 py-3 bg-emerald-500 text-black font-bold text-xs rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Simulate Daily Cron Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
