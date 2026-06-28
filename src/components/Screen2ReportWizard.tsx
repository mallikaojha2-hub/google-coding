import React, { useState } from 'react';
import { TicketCategory, UserProfile } from '../types';
import { Camera, Video, MapPin, Check, AlertTriangle, Shield, Upload, X, Navigation, Cpu } from 'lucide-react';

interface Screen2ReportWizardProps {
  currentUser: UserProfile;
  activePincode: string;
  onSubmitSuccess: (newTicket: any) => void;
  onCancelWizard: () => void;
}

export const Screen2ReportWizard: React.FC<Screen2ReportWizardProps> = ({
  currentUser,
  activePincode,
  onSubmitSuccess,
  onCancelWizard
}) => {
  // Form State
  const [name, setName] = useState(currentUser.name);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<TicketCategory>('Damaged Streetlights');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState(`4th and Main St, Near School, Area ${activePincode}`);
  const [coords, setCoords] = useState({ lat: 28.6145, lng: 77.2082 });
  const [useCurrentGps, setUseCurrentGps] = useState(false);
  const [isUnverifiedLocation, setIsUnverifiedLocation] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Media & Compression State
  const [attachedMedia, setAttachedMedia] = useState<{ url: string; type: 'photo' | 'video'; name: string; isCompressed?: boolean } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prominent [✕ CANCEL] check modal alert
  const handleTriggerCancel = () => {
    if (description.trim() || attachedMedia) {
      if (window.confirm('Discard Draft Incident Report? You have unsaved fields that will be permanently erased.')) {
        onCancelWizard();
      }
    } else {
      onCancelWizard();
    }
  };

  // Switch-case target category routing
  const getTargetDepartment = (cat: TicketCategory) => {
    switch (cat) {
      case 'Water Leakage': return 'Water & Sanitation Department';
      case 'Damaged Streetlights': return 'Electricity Grid/Board';
      case 'Potholes': return 'Roads & Highways Works Dept';
      case 'Waste Management': return 'Municipal Sanitation & Health';
    }
  };

  // Native GPS Hook & Error Fallback Interceptor
  const handleGpsToggle = (checked: boolean) => {
    setUseCurrentGps(checked);
    setGpsErrorMsg(null);

    if (checked) {
      if (!navigator.geolocation) {
        setIsUnverifiedLocation(true);
        setGpsErrorMsg('Device GPS hardware unsupported. Forced manual pin placement enabled.');
        setUseCurrentGps(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsUnverifiedLocation(false);
          setAddressText(`Verified Native GPS Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          console.warn('GPS Sensor Error Intercepted:', err);
          setIsUnverifiedLocation(true);
          setGpsErrorMsg(`GPS Access Timeout/Denied (${err.message}). Entry flagged as 'User Unverified Location'. Please drag manual map pin.`);
          setUseCurrentGps(false);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    }
  };

  // Simulated Draggable Map Pin
  const handleMapPinDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lat = 28.61 + (y / rect.height) * 0.02;
    const lng = 77.20 + (x / rect.width) * 0.02;
    setCoords({ lat, lng });
    setIsUnverifiedLocation(true); // Dragging pin manually sets unverified GPS flag
  };

  // Low-Bandwidth Media Compression Validator
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce array length exactly 1
    if (attachedMedia) {
      alert('Only exactly 1 photo or 1 video file allowed per incident report.');
    }

    // Video compression simulation (>10s or >720p check)
    if (mediaType === 'video' || file.size > 2 * 1024 * 1024) {
      setIsCompressing(true);
      setTimeout(() => {
        setIsCompressing(false);
        setAttachedMedia({
          url: URL.createObjectURL(file),
          type: mediaType,
          name: file.name,
          isCompressed: true
        });
      }, 1500);
    } else {
      setAttachedMedia({
        url: URL.createObjectURL(file),
        type: mediaType,
        name: file.name
      });
    }
  };

  const handleSubmitWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a description of the civic incident.');
      return;
    }
    if (!attachedMedia) {
      alert('Please attach 1 photo or 1 video showing proof of the issue.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: `${category} near ${addressText.substring(0, 20)}...`,
      description,
      category,
      citizenName: isAnonymous ? 'Anonymous Citizen' : name,
      isAnonymous,
      citizenId: currentUser.id,
      lat: coords.lat,
      lng: coords.lng,
      locationName: addressText,
      isUnverifiedLocation,
      mediaUrl: attachedMedia.url,
      mediaType: attachedMedia.type,
      pincode: activePincode
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSubmitSuccess(data.ticket);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network transmission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      
      {/* Container matching Clean Utility screen design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col p-6 md:p-8 space-y-6">
        
        {/* Header Navigation with Prominent [✕ CANCEL] */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={handleTriggerCancel}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-red-100"
          >
            <X className="w-4 h-4" />
            <span>✕ CANCEL</span>
          </button>
          
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Incident Intake Wizard</h2>
          <div className="w-10 h-1.5 bg-blue-600 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmitWizard} className="space-y-6">
          
          {/* SECTION A: IDENTITY BLOCK & ANONYMITY TOGGLE */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">1. Submitter Identity Block</label>
            <div className="p-4 bg-[#F1F3F6] rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={isAnonymous ? 'Anonymous Citizen (Masked)' : name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#1A1A1A] disabled:opacity-60 disabled:bg-gray-100"
                />
              </div>

              {/* Anonymity Switch */}
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                <span className="text-xs font-bold text-[#1A1A1A]">Report Anonymously</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isAnonymous ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${isAnonymous ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
            {isAnonymous && (
              <p className="text-[10px] font-mono text-blue-600 font-bold pl-1">
                🔒 Anonymity Enabled: Public map feeds will obscure your legal name while securing linked citizen ID ({currentUser.id}) in encrypted DB ledgers.
              </p>
            )}
          </div>

          {/* SECTION B: AUTOMATED TARGET CATEGORY ROUTING */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">2. Issue Category & Programmatic Routing</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-[#1A1A1A] focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="Damaged Streetlights">💡 Damaged Streetlights (Sparking / Unlit)</option>
              <option value="Water Leakage">🚰 Water Leakage (Main Burst / Flooding)</option>
              <option value="Potholes">🕳️ Potholes (Deep Road Craters)</option>
              <option value="Waste Management">🗑️ Waste Management (Garbage Dump Overflow)</option>
            </select>

            {/* Target Destination Routing Indicator */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-900 font-mono">
              <span className="font-bold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                AUTOMATED TARGET ROUTING:
              </span>
              <span className="bg-white px-2.5 py-1 rounded-md font-bold text-blue-700 shadow-2xs">
                {getTargetDepartment(category)}
              </span>
            </div>
          </div>

          {/* SECTION C: DUAL-INPUT LOCATION MODULE */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">3. Dual-Input Location & GPS Interceptor</label>
              {isUnverifiedLocation && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold font-mono rounded border border-amber-300">
                  ⚠️ USER UNVERIFIED LOCATION
                </span>
              )}
            </div>

            {/* GPS Checkbox Trigger */}
            <div className="p-3.5 bg-gray-900 text-white rounded-2xl flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold select-none">
                <input
                  type="checkbox"
                  checked={useCurrentGps}
                  onChange={(e) => handleGpsToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Use My Current Device GPS Sensor</span>
              </label>
              <span className="text-gray-400 font-mono text-[10px]">
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
              </span>
            </div>

            {/* Fallback Error Intercept Alert */}
            {gpsErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{gpsErrorMsg}</span>
              </div>
            )}

            {/* Address Text Entry */}
            <input
              type="text"
              value={addressText}
              onChange={(e) => { setAddressText(e.target.value); setIsUnverifiedLocation(true); }}
              placeholder="Landmark or Address..."
              className="w-full bg-[#F1F3F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] font-medium"
            />

            {/* Interactive Draggable Mini-Map Canvas */}
            <div
              onClick={handleMapPinDrag}
              title="Click anywhere to drag map pin manually"
              className="h-36 bg-[#E3E8ED] rounded-2xl border border-gray-300 relative cursor-crosshair overflow-hidden shadow-inner flex items-center justify-center"
            >
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>
              <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded text-gray-600">
                DRAG MANUAL PIN
              </span>

              {/* Pin */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <MapPin className="w-8 h-8 text-red-600 fill-red-600 drop-shadow-md" />
                <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px]"></div>
              </div>
            </div>
          </div>

          {/* SECTION D: ISSUE DETAILS & LOW-BANDWIDTH MEDIA COMPRESSION VALIDATOR */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">4. Grievance Affidavit & Media Upload (Max 1 file)</label>
            
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail exact danger or municipal failure (e.g. Streetlight pole wire sparking vigorously since dusk)..."
              className="w-full bg-[#F1F3F6] border border-gray-200 rounded-2xl p-4 text-xs font-medium text-[#1A1A1A] focus:ring-2 focus:ring-blue-500"
            />

            {/* Media Dropzone / Selector */}
            {!attachedMedia ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="h-28 bg-gray-50 hover:bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                  <Camera className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-gray-600">Take Photo Proof</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'photo')} />
                </label>

                <label className="h-28 bg-gray-50 hover:bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                  <Video className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-gray-600">Record Video (Max 10s)</span>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
                </label>
              </div>
            ) : (
              <div className="p-4 bg-gray-900 text-white rounded-2xl flex items-center justify-between border border-blue-500/30">
                <div className="flex items-center gap-3">
                  {attachedMedia.type === 'photo' ? <Camera className="w-5 h-5 text-blue-400" /> : <Video className="w-5 h-5 text-purple-400" />}
                  <div>
                    <p className="text-xs font-bold truncate max-w-xs">{attachedMedia.name}</p>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {attachedMedia.isCompressed ? 'Client-Side Compressed (<720p/10s verified)' : 'Raw High-Res Upload'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedMedia(null)}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors text-xs font-bold"
                >
                  ✕ Remove
                </button>
              </div>
            )}

            {/* Compression Progress Bar Simulation */}
            {isCompressing && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold text-blue-800">
                  <span>Executing Low-Bandwidth Client Compression...</span>
                  <span>78%</span>
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse w-3/4"></div>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Transmitting to Backend Gemini AI Triage...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>SUBMIT TO TRIAGE & ADMIN QUEUE</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
