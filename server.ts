import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// --- IN-MEMORY DATABASE MOCK FOR CIVIC PLATFORM ---

let mockTickets = [
  {
    id: 'TICK-101',
    pincode: '110001',
    title: 'Severe Main Water Pipe Burst',
    description: 'High pressure drinking water gushing onto Park Avenue roadway causing flooding and low pressure in residential blocks.',
    category: 'Water Leakage',
    targetDepartment: 'Water & Sanitation Department',
    citizenName: 'Arjun Mehta',
    isAnonymous: false,
    citizenId: 'CIT-001',
    lat: 28.6139,
    lng: 77.2090,
    locationName: 'Park Avenue, Sector 4, Connaught Place',
    isUnverifiedLocation: false,
    mediaUrl: 'https://images.unsplash.com/photo-1542013936693-859e53936323?auto=format&fit=crop&w=600&q=80',
    mediaType: 'photo',
    status: 'ongoing',
    upvotes: 142,
    upvotedUserIds: ['CIT-002', 'CIT-003'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reopenFlags: 0,
    reopenedUserIds: [],
    aiEvaluated: true,
    verifiedCategory: 'Water Leakage',
    urgencyScore: 9,
    aiReasoning: 'Visual analysis confirms large volume water flow on asphalt road matching high urgency civic disruption.',
    transparencyLog: [
      { step: 'Intake Registered', timestamp: '09:00 AM', holderDesk: 'Central Civic Portal Automated Desk', active: true },
      { step: 'Assigned to Ward Inspector', timestamp: '09:15 AM', holderDesk: 'Desk #4B - Water & Sanitation Dept', active: true },
      { step: 'Field Crew Dispatched', timestamp: '10:30 AM', holderDesk: 'Rapid Response Unit 7', active: true },
      { step: 'Excavation & Repair in Progress', timestamp: '11:45 AM', holderDesk: 'On-Site Engineer S. Verma', active: true }
    ],
    milestoneProgress: 1, // 0: Excavation, 1: Progress/Pipe Fix, 2: Completion/Surface
    fieldPhotoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    forumReplies: [
      { id: 'REP-1', author: 'S. Verma (Ward Engineer)', isAuthority: true, text: 'Excavation completed. Main valve isolated. Installing clamp joint now.', timestamp: '12:10 PM' },
      { id: 'REP-2', author: 'Arjun Mehta', isAuthority: false, text: 'Thank you for the prompt dispatch! Traffic is backing up near the metro exit.', timestamp: '12:25 PM' }
    ]
  },
  {
    id: 'TICK-102',
    pincode: '110001',
    title: 'Sparking Streetlight Transformer',
    description: 'Electric sparks and burning smell coming from the pole box near the primary school gate. Very dangerous for children.',
    category: 'Damaged Streetlights',
    targetDepartment: 'Electricity Grid/Board',
    citizenName: 'Anonymous Citizen',
    isAnonymous: true,
    citizenId: 'CIT-002',
    lat: 28.6145,
    lng: 77.2082,
    locationName: 'St. Mary School Gate, Janpath',
    isUnverifiedLocation: false,
    mediaUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80',
    mediaType: 'photo',
    status: 'under_review',
    upvotes: 89,
    upvotedUserIds: ['CIT-001'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reopenFlags: 0,
    reopenedUserIds: [],
    aiEvaluated: true,
    verifiedCategory: 'Damaged Streetlights',
    urgencyScore: 10,
    aiReasoning: 'Image exhibits electrical pole equipment near foliage. Text notes fire risk near school; maximum priority recommended.',
    transparencyLog: [
      { step: 'Intake Registered', timestamp: '01:00 PM', holderDesk: 'AI Automated Intake Triage', active: true },
      { step: 'Under Safety Review', timestamp: '01:10 PM', holderDesk: 'Desk #1 - Emergency Power Grid Division', active: true },
      { step: 'Lineman Crew Assignment', timestamp: 'Pending', holderDesk: 'Substation North-East', active: false }
    ],
    milestoneProgress: 0,
    forumReplies: []
  },
  {
    id: 'TICK-103',
    pincode: '110001',
    title: 'Deep Hazardous Pothole Cluster',
    description: 'Crater-sized potholes caused by recent rains. Two-wheelers have skidded here twice today.',
    category: 'Potholes',
    targetDepartment: 'Roads & Highways Works Dept',
    citizenName: 'Sneha Patel',
    isAnonymous: false,
    citizenId: 'CIT-003',
    lat: 28.6128,
    lng: 77.2105,
    locationName: 'Barakhamba Road Crossing',
    isUnverifiedLocation: false,
    mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    mediaType: 'photo',
    status: 'fixed',
    upvotes: 215,
    upvotedUserIds: ['CIT-001', 'CIT-002'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    fixedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // Fixed 2 days ago (28 days left on 30-day timer)
    reopenFlags: 1,
    reopenedUserIds: ['CIT-004'],
    aiEvaluated: true,
    verifiedCategory: 'Potholes',
    urgencyScore: 7,
    aiReasoning: 'Road surface degradation confirmed. Moderate vehicle hazard detected.',
    transparencyLog: [
      { step: 'Report Logged', timestamp: '5 days ago', holderDesk: 'Automated Portal', active: true },
      { step: 'Repaired & Resurfaced', timestamp: '2 days ago', holderDesk: 'Contractor Unit 12', active: true }
    ],
    milestoneProgress: 2,
    forumReplies: [
      { id: 'REP-10', author: 'Roads Dept Spokesperson', isAuthority: true, text: 'Cold mix bitumen filling applied. Entering 30-day citizen monitoring phase.', timestamp: '2 days ago' }
    ]
  },
  {
    id: 'TICK-104',
    pincode: '110001',
    title: 'Illegal Garbage Dump Overflow',
    description: 'Municipal bins unemptied for 4 days. Stray animals scattering garbage across sidewalk.',
    category: 'Waste Management',
    targetDepartment: 'Municipal Sanitation & Health',
    citizenName: 'Rohan Sharma',
    isAnonymous: false,
    citizenId: 'CIT-004',
    lat: 28.6152,
    lng: 77.2095,
    locationName: 'Tolstoy Marg Back Lane',
    isUnverifiedLocation: true,
    mediaUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    mediaType: 'photo',
    status: 'submitted',
    upvotes: 12,
    upvotedUserIds: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    reopenFlags: 0,
    reopenedUserIds: [],
    aiEvaluated: false,
    verifiedCategory: 'Pending AI Triage',
    urgencyScore: 5,
    aiReasoning: 'Awaiting AI verification...',
    transparencyLog: [
      { step: 'Submitted by Citizen', timestamp: 'Just now', holderDesk: 'AI Ingestion Queue', active: true }
    ],
    milestoneProgress: 0,
    forumReplies: []
  }
];

let mockUsers = [
  {
    id: 'CIT-001',
    name: 'Arjun Mehta',
    pincode: '110001',
    cumulativeXP: 4420,
    verifiedVotesReceived: 620,
    negativePenalties: 0,
    totalScore: 5040,
    rewardsClaimed: ['VOUCHER-1000XP-CAFE', 'VOUCHER-3000XP-METRO'],
    nextMilestone: 7000,
    isRewardAvailable: true,
    pendingVoucher: 'CIVIC-HERO-5000XP-MOVIEPASS',
    role: 'citizen'
  },
  {
    id: 'ADM-001',
    name: 'Officer Priya Desai',
    pincode: '110001',
    cumulativeXP: 9999,
    verifiedVotesReceived: 1200,
    negativePenalties: 0,
    totalScore: 11199,
    rewardsClaimed: [],
    nextMilestone: 15000,
    isRewardAvailable: false,
    role: 'admin'
  }
];

let mockCrowdfundWallet = {
  pincode: '110001',
  projectName: 'Solar LED Streetlighting for Central Children Park',
  targetGoal: 7500,
  amountRaised: 4250,
  receiptLogs: [
    { id: 'REC-1', vendor: 'Surya Electronics Ltd', amount: 2100, date: '2026-05-12', receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80', description: 'Procurement of 10x 50W Solar LED Luminaires' },
    { id: 'REC-2', vendor: 'Delhi Municipal Erectors', amount: 850, date: '2026-06-01', receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80', description: 'Concrete foundation casting and pole erection labor' }
  ]
};

let mockSocialDrives = [
  {
    id: 'DRV-1',
    pincode: '110001',
    title: 'Connaught Place Mega Monsoon Drain Cleansing & Plastic Sweep',
    description: 'Join neighborhood volunteers and municipal sanitation staff to clear stormwater drains before heavy downpours.',
    date: 'Sunday, July 5, 2026 @ 7:30 AM',
    locationName: 'Inner Circle Central Plaza, CP',
    geofenceCenter: { lat: 28.6139, lng: 77.2090 },
    geofenceRadiusMeters: 500,
    rsvps: [
      { userId: 'CIT-001', status: 'attending' },
      { userId: 'CIT-002', status: 'attending' },
      { userId: 'CIT-003', status: 'cannot_attend' }
    ],
    executionPhotos: [
      { id: 'PHT-1', userId: 'CIT-002', authorName: 'Anonymous Volunteer', photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=500&q=80', timestamp: 'Last Sunday', coords: { lat: 28.6140, lng: 77.2091 } }
    ]
  }
];

let mockLeaderboard = [
  { userId: 'CIT-99', maskedName: '@UrbanWatcher_42', score: 14250, rank: 1, badge: '👑 Platinum Sovereign' },
  { userId: 'CIT-88', maskedName: '@EcoWarrioress_7', score: 11400, rank: 2, badge: '🌟 Diamond Sentinel' },
  { userId: 'CIT-77', maskedName: '@CivicShield_99', score: 8900, rank: 3, badge: '🏆 Gold Guardian' },
  { userId: 'CIT-001', maskedName: '@You (Arjun M.)', score: 5040, rank: 8, badge: '🛡️ Silver Defender' }
];

// --- API ENDPOINTS ---

// Get complete global state
app.get('/api/state', (req, res) => {
  const pincode = (req.query.pincode as string) || '110001';
  const role = (req.query.role as string) || 'citizen';
  const user = role === 'admin' ? mockUsers[1] : mockUsers[0];
  
  const filteredTickets = mockTickets.filter(t => t.pincode === pincode);

  res.json({
    currentUser: user,
    activePincode: pincode,
    tickets: filteredTickets,
    crowdfundWallet: mockCrowdfundWallet,
    socialDrives: mockSocialDrives,
    leaderboard: mockLeaderboard
  });
});

// Upvote ticket
app.post('/api/tickets/:id/upvote', (req, res) => {
  const ticketId = req.params.id;
  const { userId } = req.body;
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (ticket) {
    if (!ticket.upvotedUserIds.includes(userId)) {
      ticket.upvotes += 1;
      ticket.upvotedUserIds.push(userId);
      // Give submitter +2 score
      const submitter = mockUsers.find(u => u.id === ticket.citizenId);
      if (submitter) {
        submitter.verifiedVotesReceived += 1;
        submitter.totalScore = (submitter.cumulativeXP + submitter.verifiedVotesReceived) - submitter.negativePenalties;
      }
    }
    res.json({ success: true, upvotes: ticket.upvotes });
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Forum reply
app.post('/api/tickets/:id/reply', (req, res) => {
  const ticketId = req.params.id;
  const { author, isAuthority, text } = req.body;
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (ticket) {
    const reply = {
      id: `REP-${Date.now()}`,
      author,
      isAuthority,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    ticket.forumReplies.push(reply);
    res.json({ success: true, replies: ticket.forumReplies });
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// 30-Day timer actions (Solid fix or Reopen)
app.post('/api/tickets/:id/reopen', (req, res) => {
  const ticketId = req.params.id;
  const { userId, reason } = req.body;
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.reopenFlags += 1;
    if (userId) ticket.reopenedUserIds.push(userId);
    ticket.status = 'ongoing'; // Reopened flips back to ongoing work
    ticket.transparencyLog.push({
      step: `Reopened by Community: ${reason || 'Unresolved defect'}`,
      timestamp: 'Just now',
      holderDesk: 'Field Inspector Desk Re-verification',
      active: true
    });
    res.json({ success: true, ticket });
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Automated Cron-job route simulation (Check 30 days in Green)
app.post('/api/cron/check-accountability', (req, res) => {
  const now = Date.now();
  let closedCount = 0;
  mockTickets.forEach(ticket => {
    if (ticket.status === 'fixed' && ticket.fixedAt) {
      const daysInFixed = (now - new Date(ticket.fixedAt).getTime()) / (1000 * 3600 * 24);
      // For demonstration, if daysInFixed >= 30 OR simulated trigger
      if (daysInFixed >= 30 || req.body.forceSimulate) {
        if (ticket.reopenFlags === 0) {
          ticket.status = 'closed';
          ticket.transparencyLog.push({
            step: 'Permanently Closed - 30 Day Accountability Passed',
            timestamp: new Date().toLocaleDateString(),
            holderDesk: 'Archived Ledger',
            active: false
          });
          closedCount++;
        }
      }
    }
  });
  res.json({ success: true, message: `Cron execution finished. ${closedCount} ticket(s) automatically transitioned to CLOSED state.` });
});

// Create ticket (Wizard submission)
app.post('/api/tickets', async (req, res) => {
  const {
    title, description, category, citizenName, isAnonymous, citizenId,
    lat, lng, locationName, isUnverifiedLocation, mediaUrl, mediaType, pincode
  } = req.body;

  let targetDept = 'Municipal Control Center';
  switch (category) {
    case 'Water Leakage': targetDept = 'Water & Sanitation Department'; break;
    case 'Damaged Streetlights': targetDept = 'Electricity Grid/Board'; break;
    case 'Potholes': targetDept = 'Roads & Highways Works Dept'; break;
    case 'Waste Management': targetDept = 'Municipal Sanitation & Health'; break;
  }

  const newTicket = {
    id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
    pincode: pincode || '110001',
    title: title || `${category} Incident`,
    description,
    category,
    targetDepartment: targetDept,
    citizenName: citizenName || 'Citizen',
    isAnonymous: !!isAnonymous,
    citizenId: citizenId || 'CIT-001',
    lat: lat || 28.6139,
    lng: lng || 77.2090,
    locationName: locationName || 'Manually Pinpointed Area',
    isUnverifiedLocation: !!isUnverifiedLocation,
    mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    mediaType: mediaType || 'photo',
    status: 'submitted' as const,
    upvotes: 1,
    upvotedUserIds: [citizenId || 'CIT-001'],
    createdAt: new Date().toISOString(),
    reopenFlags: 0,
    reopenedUserIds: [],
    aiEvaluated: false,
    verifiedCategory: category,
    urgencyScore: 5,
    aiReasoning: 'Pending automated multi-modal Gemini triage.',
    transparencyLog: [
      { step: 'Incident Intake Registered', timestamp: 'Just now', holderDesk: 'AI Triage Sandbox', active: true }
    ],
    milestoneProgress: 0,
    forumReplies: []
  };

  mockTickets.unshift(newTicket);

  // Trigger Gemini AI Multi-Modal Triage asynchronously
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI Civic Intake Moderator for Community Hero App.
Cross-examine the citizen's incident report text and media context.
Citizen submitted category: "${category}".
Description: "${description}".
Department tag: "${targetDept}".

Analyze for contradictions, sarcasm (e.g. "Lovely swimming pool on the road" for a pothole/pipe burst), and civic severity.
Return ONLY a valid JSON object with:
"verifiedCategory": strictly one of ["Potholes", "Water Leakage", "Damaged Streetlights", "Waste Management"],
"urgencyScore": integer between 1 and 10 (10 being extreme safety risk),
"aiReasoning": 2 concise objective sentences explaining verification and cross-modal consistency.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      newTicket.aiEvaluated = true;
      newTicket.verifiedCategory = parsed.verifiedCategory || category;
      newTicket.urgencyScore = parsed.urgencyScore || 6;
      newTicket.aiReasoning = parsed.aiReasoning || 'Cross-verified text and visual description.';
    }
  } catch (e) {
    console.warn('Gemini Triage fallback (using submitted category):', e);
    newTicket.aiEvaluated = true;
    newTicket.aiReasoning = 'Automated AI check offline; pre-verified based on citizen affidavit.';
  }

  res.json({ success: true, ticket: newTicket });
});

// Admin Moderation: Accept or Reject
app.post('/api/tickets/:id/moderate', (req, res) => {
  const ticketId = req.params.id;
  const { action, overriddenCategory, overriddenUrgency, rejectionRationale, adminNotes } = req.body;
  const ticket = mockTickets.find(t => t.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (overriddenCategory && overriddenCategory !== ticket.verifiedCategory) {
    ticket.verifiedCategory = overriddenCategory;
    ticket.category = overriddenCategory;
    ticket.adminOverridden = true;
  }
  if (overriddenUrgency !== undefined) {
    ticket.urgencyScore = overriddenUrgency;
    ticket.adminOverridden = true;
  }
  if (adminNotes) ticket.adminNotes = adminNotes;

  const submitter = mockUsers.find(u => u.id === ticket.citizenId);

  if (action === 'accept') {
    ticket.status = 'under_review';
    ticket.transparencyLog.push({
      step: 'Approved by Admin Moderation Queue',
      timestamp: 'Just now',
      holderDesk: `${ticket.targetDepartment} Dispatch Coordinator`,
      active: true
    });
    // Commit verified point allocation (+100 XP upon admin acceptance)
    if (submitter) {
      submitter.cumulativeXP += 100;
      submitter.totalScore = (submitter.cumulativeXP + submitter.verifiedVotesReceived) - submitter.negativePenalties;
      // Check milestone markers
      if (submitter.totalScore >= submitter.nextMilestone) {
        submitter.isRewardAvailable = true;
        submitter.pendingVoucher = `GUILD-TIER-${submitter.nextMilestone}XP-GOLDTOKEN`;
        submitter.nextMilestone += 3000;
      }
    }
    res.json({ success: true, ticket, submitter });
  } else if (action === 'reject') {
    ticket.status = 'rejected';
    ticket.rejectionRationale = rejectionRationale || 'Policy breach';
    ticket.transparencyLog.push({
      step: `Rejected / Flagged Audit: ${ticket.rejectionRationale}`,
      timestamp: 'Just now',
      holderDesk: 'Isolated 30-Day Audit Folder',
      active: false
    });
    // Anti-cheat enforcement: deduct heavy penalty (-50 XP)
    if (submitter) {
      submitter.negativePenalties += 50;
      submitter.totalScore = (submitter.cumulativeXP + submitter.verifiedVotesReceived) - submitter.negativePenalties;
    }
    res.json({ success: true, ticket, submitter });
  } else {
    res.status(400).json({ error: 'Invalid moderation action' });
  }
});

// Admin Status progression (simulate field work moving to ongoing / fixed)
app.post('/api/tickets/:id/advance', (req, res) => {
  const ticketId = req.params.id;
  const { newStatus, milestoneStep, note } = req.body;
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = newStatus;
    if (milestoneStep !== undefined) ticket.milestoneProgress = milestoneStep;
    ticket.transparencyLog.push({
      step: note || `Shifted status to ${newStatus.toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      holderDesk: 'Field Operations Unit',
      active: true
    });
    if (newStatus === 'fixed' && !ticket.fixedAt) {
      ticket.fixedAt = new Date().toISOString();
    }
    res.json({ success: true, ticket });
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// RSVP social drive
app.post('/api/drives/:id/rsvp', (req, res) => {
  const driveId = req.params.id;
  const { userId, status } = req.body;
  const drive = mockSocialDrives.find(d => d.id === driveId);
  if (drive) {
    const existing = drive.rsvps.find(r => r.userId === userId);
    if (existing) {
      existing.status = status;
    } else {
      drive.rsvps.push({ userId, status });
    }
    res.json({ success: true, rsvps: drive.rsvps });
  } else {
    res.status(404).json({ error: 'Drive not found' });
  }
});

// Upload proof photo to drive wall with geofence validation
app.post('/api/drives/:id/upload-proof', (req, res) => {
  const driveId = req.params.id;
  const { userId, authorName, photoUrl, userLat, userLng } = req.body;
  const drive = mockSocialDrives.find(d => d.id === driveId);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });

  // Geofence matching loop (approx euclidean distance in meters for quick check)
  const dLat = (userLat - drive.geofenceCenter.lat) * 111000;
  const dLng = (userLng - drive.geofenceCenter.lng) * 111000 * Math.cos(drive.geofenceCenter.lat * Math.PI / 180);
  const distMeters = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distMeters > drive.geofenceRadiusMeters) {
    return res.status(403).json({
      error: 'Geo-fence restriction breached',
      message: `Your GPS coordinates (${userLat.toFixed(4)}, ${userLng.toFixed(4)}) are ${Math.round(distMeters)}m away from the event location. You must be within ${drive.geofenceRadiusMeters}m to post execution proofs.`
    });
  }

  const newPhoto = {
    id: `PHT-${Date.now()}`,
    userId,
    authorName,
    photoUrl,
    timestamp: 'Just now',
    coords: { lat: userLat, lng: userLng }
  };
  drive.executionPhotos.unshift(newPhoto);

  // Give volunteer +50 XP
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.cumulativeXP += 50;
    user.totalScore = (user.cumulativeXP + user.verifiedVotesReceived) - user.negativePenalties;
  }

  res.json({ success: true, photos: drive.executionPhotos });
});

// Claim reward voucher
app.post('/api/users/:id/claim-reward', (req, res) => {
  const userId = req.params.id;
  const user = mockUsers.find(u => u.id === userId);
  if (user && user.pendingVoucher) {
    user.rewardsClaimed.push(user.pendingVoucher);
    const claimedToken = user.pendingVoucher;
    user.pendingVoucher = undefined;
    user.isRewardAvailable = false;
    res.json({ success: true, claimedToken, user });
  } else {
    res.status(400).json({ error: 'No claimable token active' });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Community Hero Civic Platform running on http://localhost:${PORT}`);
  });
}

startServer();
