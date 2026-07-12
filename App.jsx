import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, Send, Sparkles, PlusCircle, User as UserIcon,
  Home as HomeIcon, Compass, ArrowLeft, Lock, Mail, X, Settings,
  Play, Music, ChevronRight, Camera, Check, Star, Search,
  Video as VideoIcon, Image as ImageIcon, RotateCcw
} from 'lucide-react';

/* ---------------------------------------------------------
   dotblogs — a 2000s beauty diary, styled like a glossy
   magazine. No Firebase required: state is local and saved
   with window.storage so it's still here next time.
--------------------------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600&display=swap');`;

const CREAM = '#FDF6F4';
const INK = '#2B2024';
const ROSE = '#C1587A';
const ROSE_DEEP = '#A83F60';
const BLUSH = '#F7DEE4';
const BLUSH_SOFT = '#FBEDF0';
const GOLD = '#C6A467';
const LINE = '#EFDCE1';

const CATEGORIES = ['All', 'GRWM', 'Skin care', 'Hair care', 'Glow up tips', 'Outfit inspiration', 'Other'];

const MUSIC_OPTIONS = ['Bubblegum Pop', 'Y2K Dance Rave', 'Lo-fi Chill Vibe', 'Glitter Ballad'];
const FILTER_OPTIONS = ['Normal', 'Pink Pastel', 'Sparkle', 'Retro VHS'];
const FILTER_CSS = {
  'Normal': 'none',
  'Pink Pastel': 'saturate(0.85) brightness(1.05) sepia(0.15) hue-rotate(-10deg)',
  'Sparkle': 'contrast(1.1) saturate(1.35) brightness(1.06)',
  'Retro VHS': 'contrast(1.15) saturate(0.7) sepia(0.25) brightness(0.95)',
};
const MAX_VIDEO_SECONDS = 420; // 7 minutes
const MAX_ACCOUNTS = 4;

const WEEKLY_IDEAS = [
  { id: 'idea-1', title: 'Show Your Haircare Routine', description: 'Walk us through wash day to finishing product — the steps that get your hair camera-ready.', category: 'Hair care' },
  { id: 'idea-2', title: 'Your Skincare Routine', description: 'Morning or night, take us through your everyday skincare, step by step.', category: 'Skin care' },
  { id: 'idea-3', title: 'Everyday GRWM', description: 'Your go-to get-ready-with-me — the makeup routine you actually do most days.', category: 'GRWM' },
  { id: 'idea-4', title: 'Self-Care Sunday', description: 'Show the little rituals that make you feel put-together and glowing.', category: 'Glow up tips' },
  { id: 'idea-5', title: 'Y2K Outfit Try-On', description: 'Mix and match your favorite pieces into a full early-2000s look.', category: 'Outfit inspiration' },
];

const DEFAULT_AVATAR = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
     <circle cx="50" cy="50" r="50" fill="${BLUSH}"/>
     <circle cx="50" cy="40" r="17" fill="${ROSE}" opacity="0.5"/>
     <path d="M18 92c3-24 19-36 32-36s29 12 32 36" fill="${ROSE}" opacity="0.5"/>
   </svg>`
);

const uid = () => 'user_' + Math.random().toString(36).slice(2, 9);
const vid = () => 'vid_' + Math.random().toString(36).slice(2, 9);

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* a couple of quiet accent stars — used sparingly, not confetti */
function AccentStars() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Star className="absolute w-3 h-3 twinkle" style={{ top: '14%', left: '8%', color: GOLD, animationDelay: '0s' }} fill="currentColor" />
      <Star className="absolute w-2 h-2 twinkle" style={{ top: '70%', right: '10%', color: GOLD, animationDelay: '1.1s' }} fill="currentColor" />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('auth'); // auth | onboarding | app
  const [authMode, setAuthMode] = useState('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [accounts, setAccounts] = useState({});
  const [currentEmail, setCurrentEmail] = useState(null);

  const [profile, setProfile] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);

  const [onbUsername, setOnbUsername] = useState('');
  const [onbHandle, setOnbHandle] = useState('');
  const [onbBio, setOnbBio] = useState('');
  const [onbAvatar, setOnbAvatar] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [category, setCategory] = useState('All');
  const [toast, setToast] = useState(null);
  const [openComments, setOpenComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentOverlay, setCommentOverlay] = useState({});

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [stUsername, setStUsername] = useState('');
  const [stHandle, setStHandle] = useState('');
  const [stBio, setStBio] = useState('');
  const [stAvatar, setStAvatar] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccEmail, setAddAccEmail] = useState('');
  const [addAccPassword, setAddAccPassword] = useState('');

  const [showStudio, setShowStudio] = useState(false);
  const [studioStep, setStudioStep] = useState('capture'); // 'capture' | 'edit'
  const [studioTitle, setStudioTitle] = useState('');
  const [studioCategory, setStudioCategory] = useState('GRWM');
  const [studioMusic, setStudioMusic] = useState(MUSIC_OPTIONS[0]);
  const [studioFilter, setStudioFilter] = useState(FILTER_OPTIONS[0]);
  const [studioCaption, setStudioCaption] = useState('');
  const [studioCaptionFont, setStudioCaptionFont] = useState('sans'); // 'sans' | 'serif'
  const [studioDuration, setStudioDuration] = useState(0);
  const [studioTrimStart, setStudioTrimStart] = useState(0);
  const [studioTrimEnd, setStudioTrimEnd] = useState(0);
  const [studioThumbnail, setStudioThumbnail] = useState('');
  const [studioVideoUrl, setStudioVideoUrl] = useState('');
  const [processingVideo, setProcessingVideo] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);

  const fileInputRef = useRef(null);
  const settingsFileInputRef = useRef(null);
  const thumbnailFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const liveVideoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get('dotblogs-state');
        if (res && res.value) {
          const data = JSON.parse(res.value);
          setAccounts(data.accounts || {});
          setCurrentEmail(data.currentEmail || null);
          if (data.profile) {
            setProfile(data.profile);
            setMyVideos(data.myVideos || []);
            setLikedIds(data.likedIds || []);
            setFollowing(data.following || []);
            setFollowerCount(data.followerCount ?? 0);
            setView('app');
          }
        }
      } catch (e) { /* no saved state yet */ }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const persist = async (overrides = {}) => {
    const payload = { accounts, currentEmail, profile, myVideos, likedIds, following, followerCount, ...overrides };
    try { await window.storage.set('dotblogs-state', JSON.stringify(payload)); }
    catch (e) { /* storage unavailable, app still works this session */ }
  };

  /* every registered handle on this device — handles must be unique */
  const isHandleTaken = (handle, excludeProfileId) => {
    const h = handle.toLowerCase();
    return Object.values(accounts).some(
      acc => acc.savedProfile && acc.savedProfile.id !== excludeProfileId && acc.savedProfile.handle.toLowerCase() === h
    );
  };

  const getAllPeople = () => {
    const map = new Map();
    Object.values(accounts).forEach(acc => {
      if (acc.savedProfile) map.set(acc.savedProfile.handle, { username: acc.savedProfile.username, handle: acc.savedProfile.handle, avatar: acc.savedProfile.avatar });
    });
    if (profile) map.set(profile.handle, { username: profile.username, handle: profile.handle, avatar: profile.avatar });
    return Array.from(map.values());
  };

  const handleSignUp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!authEmail || !authPassword) return showToast("Enter an email and password.");
    if (authPassword.length < 5) return showToast("Password needs 5+ characters.");
    const email = authEmail.toLowerCase().trim();
    if (accounts[email]) return showToast("That email is already registered.");
    const accountCount = Object.values(accounts).filter(acc => acc.savedProfile).length;
    if (accountCount >= MAX_ACCOUNTS) return showToast(`You can only have ${MAX_ACCOUNTS} accounts on this device.`);
    setCurrentEmail(email);
    setAuthMode('pending-onboard');
    setView('onboarding');
    showToast("Now, choose how you'll appear.");
  };

  const handleLogIn = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const email = authEmail.toLowerCase().trim();
    const acc = accounts[email];
    if (!acc || acc.password !== authPassword) return showToast("Incorrect email or password.");
    showToast(`Welcome back, ${acc.username || 'friend'}.`);
    setCurrentEmail(email);
    setProfile(acc.savedProfile);
    setMyVideos(acc.savedVideos || []);
    setLikedIds(acc.savedLikes || []);
    setFollowing(acc.savedFollowing || []);
    setFollowerCount(acc.savedFollowerCount || 0);
    setView('app');
  };

  const compressImage = (file, cb, maxDim = 200) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = maxDim;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        cb(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOnboardAvatar = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (b64) => { setOnbAvatar(b64); showToast("Portrait added."); });
  };

  const handleCompleteOnboarding = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const uname = onbUsername.trim();
    if (!uname) return showToast("Pick a username first.");
    if (uname.length > 40) return showToast("Keep your username under 40 characters.");
    if (/[\n\r]/.test(uname)) return showToast("Username can't contain line breaks.");
    const handle = onbHandle.trim().toLowerCase();
    if (!handle) return showToast("Choose a unique handle — that's how people find you.");
    if (!/^[a-z0-9_.]+$/.test(handle)) return showToast("Handles can only use lowercase letters, numbers, _ and .");
    if (isHandleTaken(handle)) return showToast(`@${handle} is already taken — try another.`);
    const newProfile = { id: uid(), username: uname, handle, bio: onbBio.trim(), avatar: onbAvatar || DEFAULT_AVATAR };
    setProfile(newProfile);
    setFollowerCount(0);
    const email = authEmail.toLowerCase().trim();
    setCurrentEmail(email);
    const nextAccounts = { ...accounts, [email]: { password: authPassword, username: uname, savedProfile: newProfile, savedVideos: [], savedLikes: [], savedFollowing: [], savedFollowerCount: 0 } };
    setAccounts(nextAccounts);
    setView('app');
    showToast(`Welcome to dotblogs, ${uname}.`);
    persist({ accounts: nextAccounts, currentEmail: email, profile: newProfile, myVideos: [], likedIds: [], following: [], followerCount: 0 });
  };

  const openSettings = () => {
    setStUsername(profile.username); setStHandle(profile.handle);
    setStBio(profile.bio); setStAvatar(profile.avatar);
    setShowSettings(true);
  };
  const handleSettingsAvatar = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (b64) => setStAvatar(b64));
  };
  const saveSettings = () => {
    const uname = stUsername.trim();
    if (!uname) return showToast("Username can't be empty.");
    const handle = stHandle.trim().toLowerCase();
    if (!handle) return showToast("Handle can't be empty — that's how people find you.");
    if (!/^[a-z0-9_.]+$/.test(handle)) return showToast("Handles can only use lowercase letters, numbers, _ and .");
    if (isHandleTaken(handle, profile.id)) return showToast(`@${handle} is already taken — try another.`);
    const updated = { ...profile, username: uname, handle, bio: stBio, avatar: stAvatar };
    setProfile(updated);
    const nextAccounts = { ...accounts };
    if (currentEmail && nextAccounts[currentEmail]) {
      nextAccounts[currentEmail] = { ...nextAccounts[currentEmail], username: uname, savedProfile: updated };
      setAccounts(nextAccounts);
    }
    setShowSettings(false);
    showToast("Profile updated.");
    persist({ profile: updated, accounts: nextAccounts });
  };

  /* saves this account's current posts/likes/follows back into the accounts map before switching away */
  const checkpointCurrentAccount = (accsSnapshot) => {
    if (!currentEmail || !accsSnapshot[currentEmail]) return accsSnapshot;
    return {
      ...accsSnapshot,
      [currentEmail]: {
        ...accsSnapshot[currentEmail],
        savedProfile: profile,
        savedVideos: myVideos,
        savedLikes: likedIds,
        savedFollowing: following,
        savedFollowerCount: followerCount,
      },
    };
  };

  const switchToAccount = (email) => {
    const acc = accounts[email];
    if (!acc || !acc.savedProfile || email === currentEmail) return;
    const checkpointed = checkpointCurrentAccount(accounts);
    setAccounts(checkpointed);
    setCurrentEmail(email);
    setProfile(acc.savedProfile);
    setMyVideos(acc.savedVideos || []);
    setLikedIds(acc.savedLikes || []);
    setFollowing(acc.savedFollowing || []);
    setFollowerCount(acc.savedFollowerCount || 0);
    setShowSettings(false);
    showToast(`Switched to @${acc.savedProfile.handle}`);
    persist({
      accounts: checkpointed, currentEmail: email, profile: acc.savedProfile,
      myVideos: acc.savedVideos || [], likedIds: acc.savedLikes || [],
      following: acc.savedFollowing || [], followerCount: acc.savedFollowerCount || 0,
    });
  };

  const startAddAccount = () => {
    const email = addAccEmail.toLowerCase().trim();
    const accountCount = Object.values(accounts).filter(acc => acc.savedProfile).length;
    if (accountCount >= MAX_ACCOUNTS) return showToast(`You can only have ${MAX_ACCOUNTS} accounts on this device.`);
    if (!email || !addAccPassword) return showToast("Enter an email and password.");
    if (addAccPassword.length < 5) return showToast("Password needs 5+ characters.");
    if (accounts[email]) return showToast("That email is already registered.");
    const checkpointed = checkpointCurrentAccount(accounts);
    setAccounts(checkpointed);
    setAuthEmail(email);
    setAuthPassword(addAccPassword);
    setCurrentEmail(email);
    setProfile(null); setMyVideos([]); setLikedIds([]); setFollowing([]); setFollowerCount(0);
    setOnbUsername(''); setOnbHandle(''); setOnbBio(''); setOnbAvatar('');
    setShowSettings(false);
    setShowAddAccount(false);
    setAddAccEmail(''); setAddAccPassword('');
    setView('onboarding');
    persist({ accounts: checkpointed });
  };

  const currentUid = profile?.id;
  const allVideos = [...myVideos].sort((a, b) => b.created_at - a.created_at);
  const deviceAccountCount = Object.values(accounts).filter(acc => acc.savedProfile).length;
  const visibleVideos = category === 'All' ? allVideos : allVideos.filter(v => v.category === category);

  const searchQ = searchQuery.trim().toLowerCase();
  const matchedPeople = searchQ ? getAllPeople().filter(p => p.username.toLowerCase().includes(searchQ) || p.handle.toLowerCase().includes(searchQ)) : [];
  const matchedVideos = searchQ ? allVideos.filter(v => v.title.toLowerCase().includes(searchQ) || v.category.toLowerCase().includes(searchQ) || v.handle.toLowerCase().includes(searchQ) || v.username.toLowerCase().includes(searchQ)) : [];

  const getLikeCount = (v) => v.likes.length + (likedIds.includes(v.id) ? 1 : 0);
  const toggleLike = (v) => {
    const isLiked = likedIds.includes(v.id);
    const next = isLiked ? likedIds.filter(id => id !== v.id) : [...likedIds, v.id];
    setLikedIds(next);
    persist({ likedIds: next });
  };

  const toggleFollow = (handle) => {
    const isFollowing = following.includes(handle);
    const next = isFollowing ? following.filter(h => h !== handle) : [...following, handle];
    setFollowing(next);
    showToast(isFollowing ? `Unfollowed @${handle}` : `Following @${handle}`);
    persist({ following: next });
  };

  const getComments = (v) => [...v.comments, ...(commentOverlay[v.id] || [])];
  const submitComment = (v) => {
    if (!commentDraft.trim()) return;
    const entry = { username: profile.username, text: commentDraft.trim() };
    const next = { ...commentOverlay, [v.id]: [...(commentOverlay[v.id] || []), entry] };
    setCommentOverlay(next);
    setCommentDraft('');
  };

  const openStudioWithIdea = (idea) => {
    resetStudio();
    setStudioTitle(idea.title);
    setStudioCategory(idea.category);
    setStudioStep('edit');
    setShowStudio(true);
  };

  const stopCameraStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  };

  const startCamera = async (mode) => {
    const useMode = mode || facingMode;
    setCameraFailed(false);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraFailed(true);
      return;
    }
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useMode }, audio: true });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      setCameraFailed(true);
    }
  };

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '');
      const recorder = mimeType ? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
        if (liveVideoRef.current && liveVideoRef.current.videoWidth) {
          const canvas = document.createElement('canvas');
          canvas.width = liveVideoRef.current.videoWidth;
          canvas.height = liveVideoRef.current.videoHeight;
          canvas.getContext('2d').drawImage(liveVideoRef.current, 0, 0, canvas.width, canvas.height);
          setStudioThumbnail(canvas.toDataURL('image/jpeg', 0.85));
        }
        const reader = new FileReader();
        reader.onload = (ev) => { setStudioVideoUrl(ev.target.result); };
        reader.onerror = () => { showToast("Recorded, but couldn't attach the clip — try again."); };
        reader.readAsDataURL(blob);
        setStudioDuration(recordSeconds);
        setStudioTrimStart(0);
        setStudioTrimEnd(recordSeconds);
        stopCameraStream();
        // stays on the "capture" step so the person can review + confirm with the checkmark
      };
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => {
          if (s >= MAX_VIDEO_SECONDS - 1) { stopRecording(); return MAX_VIDEO_SECONDS; }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      setCameraFailed(true);
      stopCameraStream();
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (b64) => { setStudioThumbnail(b64); showToast("Cover photo added."); }, 400);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) {
      showToast("That video's too large (over 150MB) — try a shorter or lower-resolution clip.");
      return;
    }
    stopCameraStream();
    setProcessingVideo(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setProcessingVideo(false);
      showToast("Couldn't read that video — try a different file.");
    };
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const tempVideo = document.createElement('video');
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.setAttribute('playsinline', '');
      tempVideo.preload = 'metadata';
      // Safari needs the element actually in the document to decode frames reliably
      tempVideo.style.position = 'fixed';
      tempVideo.style.left = '-9999px';
      tempVideo.style.width = '1px';
      tempVideo.style.height = '1px';
      document.body.appendChild(tempVideo);
      tempVideo.src = dataUrl;

      const cleanup = () => { if (tempVideo.parentNode) tempVideo.parentNode.removeChild(tempVideo); };

      const captureFrame = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempVideo.videoWidth || 400;
          canvas.height = tempVideo.videoHeight || 400;
          canvas.getContext('2d').drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          setStudioThumbnail(canvas.toDataURL('image/jpeg', 0.85));
          showToast("Video added.");
        } catch (err) {
          // Video is still attached and usable — just couldn't auto-grab a cover frame
          showToast("Video added — tap \"Upload photo\" below to add a cover.");
        }
        setProcessingVideo(false);
        cleanup();
      };

      tempVideo.addEventListener('loadedmetadata', () => {
        if (tempVideo.duration && tempVideo.duration > MAX_VIDEO_SECONDS) {
          showToast("Videos can be up to 7 minutes long — try a shorter clip.");
          setProcessingVideo(false);
          cleanup();
          return;
        }
        setStudioVideoUrl(dataUrl);
        setShowStudio(true);
        setStudioStep('edit');
        const dur = tempVideo.duration || 0;
        setStudioDuration(dur);
        setStudioTrimStart(0);
        setStudioTrimEnd(dur);
        try { tempVideo.currentTime = Math.min(0.5, dur / 2); }
        catch (err) { captureFrame(); }
      });
      tempVideo.addEventListener('seeked', captureFrame, { once: true });
      tempVideo.addEventListener('error', () => {
        setProcessingVideo(false);
        showToast("Couldn't read that video — try a different file.");
        cleanup();
      });
    };
    reader.readAsDataURL(file);
  };

  const clearCoverOnly = () => {
    setStudioThumbnail(''); setStudioVideoUrl(''); setProcessingVideo(false);
    setStudioDuration(0); setStudioTrimStart(0); setStudioTrimEnd(0);
  };

  const retakeCover = () => {
    setStudioThumbnail(''); setStudioVideoUrl(''); setProcessingVideo(false);
    setStudioDuration(0); setStudioTrimStart(0); setStudioTrimEnd(0);
    setStudioStep('capture');
    startCamera();
  };

  const resetStudio = () => {
    setStudioTitle(''); setStudioCategory('GRWM'); setStudioMusic(MUSIC_OPTIONS[0]); setStudioFilter(FILTER_OPTIONS[0]);
    setStudioThumbnail(''); setStudioVideoUrl(''); setProcessingVideo(false);
    setStudioCaption(''); setStudioCaptionFont('sans');
    setStudioDuration(0); setStudioTrimStart(0); setStudioTrimEnd(0);
    setStudioStep('capture'); setFacingMode('user'); setIsRecording(false); setRecordSeconds(0);
    setCameraFailed(false);
    stopCameraStream(); stopRecording();
  };
  const publishVideo = () => {
    if (!studioTitle.trim()) return showToast("Give your post a title.");
    if (!studioThumbnail) return showToast("Add a cover photo or a video first.");
    const newVideo = {
      id: vid(), userId: currentUid, username: profile.username, handle: profile.handle, avatar: profile.avatar,
      title: studioTitle.trim(), category: studioCategory, likes: [], comments: [],
      audio: studioMusic, filter: studioFilter,
      caption: studioCaption.trim() || null, captionFont: studioCaptionFont,
      trimStart: studioVideoUrl ? studioTrimStart : null,
      trimEnd: studioVideoUrl ? studioTrimEnd : null,
      thumbnail: studioThumbnail, videoUrl: studioVideoUrl || null,
      views: 'New', duration: '0:30', created_at: Date.now(),
    };
    const next = [newVideo, ...myVideos];
    setMyVideos(next);
    setShowStudio(false);
    resetStudio();
    setActiveTab('home');
    showToast("Published to your feed.");
    // video data can easily exceed window.storage's 5MB-per-key limit, so only persist the cover photo —
    // the video itself stays playable for this browser session
    const sanitized = next.map(v => ({ ...v, videoUrl: null }));
    persist({ myVideos: sanitized });
  };

  if (!ready) {
    return (
      <div style={{ background: CREAM, minHeight: '500px' }} className="flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <Sparkles className="w-6 h-6 animate-pulse" style={{ color: ROSE }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: CREAM, color: INK }} className="min-h-[660px] w-full flex justify-center">
      <style>{`
        ${FONT_IMPORT}
        .serif { font-family: 'Bodoni Moda', serif; }
        .serif-italic { font-family: 'Bodoni Moda', serif; font-style: italic; }
        .kicker { font-family: 'Poppins', sans-serif; text-transform: uppercase; letter-spacing: 0.14em; font-size: 10px; font-weight: 500; }
        .dotblogs-scroll::-webkit-scrollbar { display: none; }
        @keyframes floatUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: floatUp .25s ease-out; }
        @keyframes twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
        .twinkle { animation: twinkle 3s ease-in-out infinite; }
        @keyframes popHeart { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .pop-heart { animation: popHeart .3s ease-out; }
        .mag-btn { background: ${ROSE}; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; font-size: 12px; transition: background .15s ease; }
        .mag-btn:hover { background: ${ROSE_DEEP}; }
        .mag-btn-outline { border: 1px solid ${ROSE}; color: ${ROSE}; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
        .underline-input { border: none; border-bottom: 1px solid ${LINE}; background: transparent; }
        .underline-input:focus { border-bottom-color: ${ROSE}; }
      `}</style>

      <div className="w-full max-w-md relative flex flex-col" style={{ background: '#FFFFFF', minHeight: '680px', boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }}>

        {/* slim browser bar */}
        <div style={{ background: BLUSH_SOFT, borderBottom: `1px solid ${LINE}` }} className="px-3 py-1.5 flex items-center gap-2 sticky top-0 z-30">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
            <span className="w-2 h-2 rounded-full" style={{ background: ROSE }} />
            <span className="w-2 h-2 rounded-full" style={{ background: INK, opacity: 0.3 }} />
          </div>
          <div className="flex-1 text-center text-[10px] kicker" style={{ color: INK, opacity: 0.5 }}>
            dotblogs.com{view === 'app' ? `/${activeTab}` : ''}
          </div>
        </div>

        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs shadow-lg fade-in"
               style={{ background: INK, color: '#fff' }}>
            {toast}
          </div>
        )}

        {/* ---------------- AUTH ---------------- */}
        {view === 'auth' && (
          <div className="px-8 py-12 flex flex-col items-center relative flex-1">
            <AccentStars />
            <p className="kicker mb-3" style={{ color: GOLD }}>Vol. 01 — the beauty diary issue</p>
            <div className="w-full flex items-center gap-3 mb-1">
              <div className="flex-1 h-px" style={{ background: INK, opacity: 0.5 }} />
              <div className="flex-1 h-px" style={{ background: INK, opacity: 0.15 }} />
            </div>
            <h1 className="serif text-5xl tracking-tight my-2" style={{ color: INK }}>dotblogs</h1>
            <div className="w-full flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: INK, opacity: 0.15 }} />
              <div className="flex-1 h-px" style={{ background: INK, opacity: 0.5 }} />
            </div>
            <p className="serif-italic text-sm text-center mb-8" style={{ opacity: 0.6 }}>your 2000s beauty diary, online</p>

            <div className="flex w-full gap-6 mb-8 justify-center" style={{ borderBottom: `1px solid ${LINE}` }}>
              {['signup', 'login'].map(m => (
                <button key={m} onClick={() => setAuthMode(m)}
                  className="pb-2.5 kicker"
                  style={authMode === m ? { color: ROSE, borderBottom: `1.5px solid ${ROSE}` } : { color: INK, opacity: 0.4 }}>
                  {m === 'signup' ? 'Sign up' : 'Log in'}
                </button>
              ))}
            </div>

            <div className="w-full flex flex-col gap-5">
              <div className="flex items-center gap-2 underline-input py-2">
                <Mail className="w-4 h-4" style={{ color: ROSE, opacity: 0.7 }} />
                <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'signup' ? handleSignUp() : handleLogIn())}
                  className="bg-transparent outline-none text-sm flex-1" />
              </div>
              <div className="flex items-center gap-2 underline-input py-2">
                <Lock className="w-4 h-4" style={{ color: ROSE, opacity: 0.7 }} />
                <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'signup' ? handleSignUp() : handleLogIn())}
                  className="bg-transparent outline-none text-sm flex-1" />
              </div>
              <button onClick={() => (authMode === 'signup' ? handleSignUp() : handleLogIn())} className="mag-btn mt-3 rounded-full py-3">
                {authMode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- ONBOARDING ---------------- */}
        {view === 'onboarding' && (
          <div className="px-7 py-8 flex-1">
            <button onClick={() => setView('auth')} className="mb-5" style={{ color: ROSE }}><ArrowLeft className="w-5 h-5" /></button>
            <p className="kicker mb-1" style={{ color: GOLD }}>Step two</p>
            <h2 className="serif text-3xl mb-1" style={{ color: INK }}>Your profile</h2>
            <p className="text-sm mb-7" style={{ opacity: 0.55 }}>How should the world see you?</p>

            <div className="flex justify-center mb-7">
              <button onClick={() => fileInputRef.current?.click()} className="relative">
                <div className="rounded-full p-1" style={{ background: '#fff', boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                  <img src={onbAvatar || DEFAULT_AVATAR} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
                </div>
                <span className="absolute bottom-1 right-1 rounded-full p-1.5" style={{ background: ROSE }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleOnboardAvatar} />
            </div>

            <div className="flex flex-col gap-5">
              <input placeholder="Username" value={onbUsername} onChange={e => setOnbUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCompleteOnboarding()}
                className="underline-input text-sm py-2 outline-none" />
              <div>
                <div className="flex items-center gap-1 underline-input py-2">
                  <span className="text-sm" style={{ color: ROSE }}>@</span>
                  <input placeholder="handle" value={onbHandle}
                    onChange={e => setOnbHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleCompleteOnboarding()}
                    className="bg-transparent outline-none text-sm flex-1" />
                </div>
                <p className="text-[10px] mt-1.5" style={{ opacity: 0.45 }}>Required — this is how people find and tag you. Must be unique.</p>
              </div>
              <textarea placeholder="Bio" value={onbBio} onChange={e => setOnbBio(e.target.value)} rows={2}
                className="underline-input text-sm py-2 outline-none resize-none" />
              <button onClick={() => handleCompleteOnboarding()} className="mag-btn mt-2 rounded-full py-3">
                Enter dotblogs
              </button>
            </div>
          </div>
        )}

        {/* ---------------- APP ---------------- */}
        {view === 'app' && profile && (
          <div className="pb-20 flex-1">
            <input ref={thumbnailFileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

            {activeTab === 'home' && (
              <div>
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <h1 className="serif text-2xl" style={{ color: INK }}>dotblogs</h1>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setShowSearch(true)}>
                      <Search className="w-5 h-5" style={{ color: ROSE }} />
                    </button>
                    <button onClick={() => setActiveTab('profile')}>
                      <div className="rounded-full p-0.5" style={{ boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                        <img src={profile.avatar} className="w-8 h-8 rounded-full object-cover" />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex gap-5 px-5 pb-3 overflow-x-auto dotblogs-scroll" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className="kicker pb-2.5 whitespace-nowrap"
                      style={category === c ? { color: ROSE, borderBottom: `1.5px solid ${ROSE}` } : { color: INK, opacity: 0.4 }}>
                      {c}
                    </button>
                  ))}
                </div>

                <div className="px-4 pt-4 grid grid-cols-2 gap-x-3 gap-y-5">
                  {visibleVideos.length === 0 && (
                    <p className="col-span-2 text-sm text-center py-10 serif-italic" style={{ opacity: 0.5 }}>Nothing here yet — be the first to post.</p>
                  )}
                  {visibleVideos.map(v => {
                    const isLiked = likedIds.includes(v.id);
                    return (
                      <div key={v.id} onClick={() => setOpenComments(v.id)} className="cursor-pointer">
                        <div className="relative rounded-lg overflow-hidden mb-2" style={{ background: '#000', aspectRatio: '4 / 5', border: `1px solid ${LINE}` }}>
                          <img src={v.thumbnail} className="absolute inset-0 w-full h-full object-cover" style={{ filter: FILTER_CSS[v.filter] || 'none' }} />
                          <span className="absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded text-white" style={{ background: 'rgba(43,32,36,0.7)' }}>{v.duration}</span>
                          <span className="absolute top-1.5 left-1.5 kicker px-1.5 py-0.5 rounded-full bg-white/85" style={{ fontSize: '8px', color: ROSE }}>{v.category}</span>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <Play className="w-6 h-6" style={{ color: '#fff' }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <img src={v.avatar} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-snug line-clamp-2" style={{ color: INK }}>{v.title}</p>
                            <p className="text-[10px] mt-1" style={{ opacity: 0.5 }}>@{v.handle}</p>
                            <p className="text-[10px]" style={{ opacity: 0.4 }}>{v.views} views &middot; {timeAgo(v.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 pl-8">
                          <button onClick={(e) => { e.stopPropagation(); toggleLike(v); }} className={`flex items-center gap-1 text-[10px] ${isLiked ? 'pop-heart' : ''}`}>
                            <Heart className="w-3 h-3" fill={isLiked ? ROSE : 'none'} style={{ color: isLiked ? ROSE : INK, opacity: isLiked ? 1 : 0.5 }} />
                            {getLikeCount(v)}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setOpenComments(v.id); }} className="flex items-center gap-1 text-[10px]" style={{ opacity: 0.5 }}>
                            <MessageCircle className="w-3 h-3" /> {getComments(v).length}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="px-5 pt-5">
                <p className="kicker mb-1" style={{ color: GOLD }}>This week's assignments</p>
                <h1 className="serif text-3xl mb-5" style={{ color: INK }}>Weekly ideas</h1>
                <div className="flex flex-col gap-4">
                  {WEEKLY_IDEAS.map(idea => (
                    <div key={idea.id} className="rounded-lg p-4" style={{ border: `1px solid ${LINE}` }}>
                      <span className="kicker" style={{ color: ROSE }}>{idea.category}</span>
                      <p className="serif text-xl mt-2 mb-1.5" style={{ color: INK }}>{idea.title}</p>
                      <p className="text-xs mb-3 leading-relaxed" style={{ opacity: 0.6 }}>{idea.description}</p>
                      <button onClick={() => openStudioWithIdea(idea)} className="text-xs flex items-center gap-1 kicker" style={{ color: ROSE }}>
                        Try this idea <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="serif text-3xl" style={{ color: INK }}>Profile</h1>
                  <button onClick={openSettings} style={{ color: ROSE }}><Settings className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="rounded-full p-1 mb-3" style={{ background: '#fff', boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                    <img src={profile.avatar} className="w-24 h-24 rounded-full object-cover" />
                  </div>
                  <p className="serif text-2xl" style={{ color: INK }}>{profile.username}</p>
                  <p className="text-xs kicker mt-0.5" style={{ opacity: 0.45 }}>@{profile.handle}</p>
                  {profile.bio && <p className="serif-italic text-sm text-center mt-3 px-8" style={{ opacity: 0.65 }}>&ldquo;{profile.bio}&rdquo;</p>}
                  <div className="flex gap-8 mt-5">
                    <div className="text-center"><p className="serif text-lg" style={{ color: ROSE }}>{myVideos.length}</p><p className="kicker" style={{ opacity: 0.45 }}>Posts</p></div>
                    <div className="text-center"><p className="serif text-lg" style={{ color: ROSE }}>{followerCount}</p><p className="kicker" style={{ opacity: 0.45 }}>Followers</p></div>
                    <div className="text-center"><p className="serif text-lg" style={{ color: ROSE }}>{following.length}</p><p className="kicker" style={{ opacity: 0.45 }}>Following</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {myVideos.length === 0 && <p className="col-span-2 text-center text-xs py-8 serif-italic" style={{ opacity: 0.5 }}>You haven't posted yet.</p>}
                  {myVideos.map(v => (
                    <div key={v.id} onClick={() => setOpenComments(v.id)} className="relative rounded-lg overflow-hidden aspect-square cursor-pointer" style={{ background: '#000', border: `1px solid ${LINE}` }}>
                      <img src={v.thumbnail} className="absolute inset-0 w-full h-full object-cover" style={{ filter: FILTER_CSS[v.filter] || 'none' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* search overlay */}
            {showSearch && (
              <div className="fixed inset-0 z-40 bg-white flex flex-col">
                <div className="px-5 pt-5 pb-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                    <ArrowLeft className="w-5 h-5" style={{ color: ROSE }} />
                  </button>
                  <div className="flex-1 flex items-center gap-2 underline-input py-2">
                    <Search className="w-4 h-4" style={{ color: ROSE, opacity: 0.7 }} />
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search people or posts" className="bg-transparent outline-none text-sm flex-1" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto dotblogs-scroll px-5 py-5">
                  {searchQ === '' && (
                    <p className="text-sm serif-italic text-center py-10" style={{ opacity: 0.5 }}>Search by @handle, name, or post title.</p>
                  )}
                  {searchQ !== '' && matchedPeople.length === 0 && matchedVideos.length === 0 && (
                    <p className="text-sm serif-italic text-center py-10" style={{ opacity: 0.5 }}>No results for &ldquo;{searchQuery}&rdquo;.</p>
                  )}
                  {matchedPeople.length > 0 && (
                    <div className="mb-7">
                      <p className="kicker mb-3" style={{ color: GOLD }}>People</p>
                      <div className="flex flex-col gap-4">
                        {matchedPeople.map(p => (
                          <div key={p.handle} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full p-0.5" style={{ boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                                <img src={p.avatar} className="w-9 h-9 rounded-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm" style={{ color: INK }}>{p.username}</p>
                                <p className="text-xs kicker" style={{ opacity: 0.45 }}>@{p.handle}</p>
                              </div>
                            </div>
                            {p.handle !== profile.handle && (
                              <button onClick={() => toggleFollow(p.handle)} className="text-[10px] px-3 py-1.5 rounded-full kicker"
                                style={following.includes(p.handle) ? { background: BLUSH_SOFT, color: INK, border: `1px solid ${LINE}` } : { background: ROSE, color: '#fff' }}>
                                {following.includes(p.handle) ? 'Following' : 'Follow'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchedVideos.length > 0 && (
                    <div>
                      <p className="kicker mb-3" style={{ color: GOLD }}>Posts</p>
                      <div className="flex flex-col gap-4">
                        {matchedVideos.map(v => (
                          <button key={v.id} onClick={() => { setShowSearch(false); setSearchQuery(''); setActiveTab('home'); setCategory('All'); setOpenComments(v.id); }}
                            className="flex items-center gap-3 text-left">
                            <img src={v.thumbnail} className="w-12 h-12 rounded-lg flex-shrink-0 object-cover" style={{ border: `1px solid ${LINE}` }} />
                            <div className="flex-1">
                              <p className="text-xs leading-snug" style={{ color: INK }}>{v.title}</p>
                              <p className="text-[10px] kicker mt-1" style={{ opacity: 0.45 }}>@{v.handle} &middot; {v.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* comments sheet */}
            {openComments && (() => {
              const v = allVideos.find(x => x.id === openComments);
              if (!v) return null;
              return (
                <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: 'rgba(43,32,36,0.35)' }} onClick={() => setOpenComments(null)}>
                  <div className="w-full max-w-md bg-white rounded-t-2xl p-5 max-h-[70%] flex flex-col fade-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <p className="serif text-lg leading-snug" style={{ color: INK }}>{v.title}</p>
                      <button onClick={() => setOpenComments(null)}><X className="w-5 h-5 flex-shrink-0" /></button>
                    </div>
                    {v.videoUrl ? (
                      <div className="relative mb-4">
                        <video
                          src={v.videoUrl}
                          poster={v.thumbnail || undefined}
                          controls
                          playsInline
                          className="w-full rounded-lg"
                          style={{ maxHeight: '260px', background: '#000', filter: FILTER_CSS[v.filter] || 'none' }}
                          onLoadedMetadata={(e) => { if (v.trimStart) e.currentTarget.currentTime = v.trimStart; }}
                          onTimeUpdate={(e) => {
                            if (v.trimEnd && e.currentTarget.currentTime >= v.trimEnd) {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = v.trimStart || 0;
                            }
                          }}
                        />
                        {v.caption && (
                          <div className="absolute bottom-2 left-2 right-2 text-center px-2 py-1 rounded pointer-events-none" style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <p className="text-white text-xs" style={{ fontFamily: v.captionFont === 'serif' ? "'Bodoni Moda', serif" : "'Poppins', sans-serif" }}>{v.caption}</p>
                          </div>
                        )}
                      </div>
                    ) : v.thumbnail ? (
                      <div className="relative mb-4">
                        <img src={v.thumbnail} className="w-full rounded-lg object-cover" style={{ maxHeight: '200px', filter: FILTER_CSS[v.filter] || 'none' }} />
                        {v.caption && (
                          <div className="absolute bottom-2 left-2 right-2 text-center px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <p className="text-white text-xs" style={{ fontFamily: v.captionFont === 'serif' ? "'Bodoni Moda', serif" : "'Poppins', sans-serif" }}>{v.caption}</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                    <p className="kicker mb-3" style={{ color: GOLD }}>Comments</p>
                    <div className="flex-1 overflow-y-auto dotblogs-scroll flex flex-col gap-3 mb-4">
                      {getComments(v).map((c, i) => (
                        <div key={i} className="text-xs"><span className="kicker" style={{ color: ROSE }}>{c.username}</span> <span style={{ opacity: 0.75 }}>{c.text}</span></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 underline-input py-2">
                      <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add a comment..."
                        className="bg-transparent outline-none text-xs flex-1" onKeyDown={e => e.key === 'Enter' && submitComment(v)} />
                      <button onClick={() => submitComment(v)}><Send className="w-4 h-4" style={{ color: ROSE }} /></button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* settings modal */}
            {showSettings && (
              <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: 'rgba(43,32,36,0.35)' }}>
                <div className="w-full max-w-sm bg-white rounded-lg p-6 max-h-[85%] overflow-y-auto dotblogs-scroll fade-in">
                  <div className="flex items-center justify-between mb-5">
                    <p className="serif text-xl" style={{ color: INK }}>Edit profile</p>
                    <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="flex justify-center mb-5">
                    <button onClick={() => settingsFileInputRef.current?.click()} className="relative">
                      <div className="rounded-full p-1" style={{ background: '#fff', boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                        <img src={stAvatar || DEFAULT_AVATAR} className="w-20 h-20 rounded-full object-cover" />
                      </div>
                      <span className="absolute bottom-0 right-0 rounded-full p-1.5" style={{ background: ROSE }}><Camera className="w-3.5 h-3.5 text-white" /></span>
                    </button>
                    <input ref={settingsFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSettingsAvatar} />
                  </div>
                  <div className="flex flex-col gap-5">
                    <input value={stUsername} onChange={e => setStUsername(e.target.value)} placeholder="Username" className="underline-input text-sm py-2 outline-none" />
                    <div className="flex items-center gap-1 underline-input py-2">
                      <span className="text-sm" style={{ color: ROSE }}>@</span>
                      <input value={stHandle} onChange={e => setStHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                        placeholder="handle" className="bg-transparent outline-none text-sm flex-1" />
                    </div>
                    <textarea value={stBio} onChange={e => setStBio(e.target.value)} rows={2} placeholder="Bio" className="underline-input text-sm py-2 outline-none resize-none" />
                    <button onClick={saveSettings} className="mag-btn mt-1 rounded-full py-3">Save changes</button>
                  </div>

                  <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${LINE}` }}>
                    <p className="kicker mb-3" style={{ color: GOLD }}>Accounts on this device</p>
                    <div className="flex flex-col gap-3 mb-3">
                      {Object.entries(accounts).filter(([, acc]) => acc.savedProfile).map(([email, acc]) => (
                        <button key={email} onClick={() => switchToAccount(email)} className="flex items-center gap-2.5 text-left"
                          style={{ opacity: email === currentEmail ? 1 : 0.55 }}>
                          <img src={acc.savedProfile.avatar} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate" style={{ color: INK }}>
                              {acc.savedProfile.username}
                              {email === currentEmail && <span style={{ color: ROSE }}> &middot; current</span>}
                            </p>
                            <p className="text-[10px] kicker" style={{ opacity: 0.45 }}>@{acc.savedProfile.handle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {!showAddAccount ? (
                      deviceAccountCount >= MAX_ACCOUNTS ? (
                        <p className="text-[10px] kicker" style={{ opacity: 0.45 }}>You've reached the {MAX_ACCOUNTS}-account limit on this device.</p>
                      ) : (
                        <button onClick={() => setShowAddAccount(true)} className="text-xs kicker" style={{ color: ROSE }}>+ Add another account</button>
                      )
                    ) : (
                      <div className="flex flex-col gap-3">
                        <input value={addAccEmail} onChange={e => setAddAccEmail(e.target.value)} placeholder="Email"
                          className="underline-input text-sm py-2 outline-none" />
                        <input type="password" value={addAccPassword} onChange={e => setAddAccPassword(e.target.value)} placeholder="Password"
                          className="underline-input text-sm py-2 outline-none" />
                        <div className="flex gap-2">
                          <button onClick={startAddAccount} className="mag-btn flex-1 rounded-full py-2 text-xs">Create account</button>
                          <button onClick={() => { setShowAddAccount(false); setAddAccEmail(''); setAddAccPassword(''); }}
                            className="flex-1 rounded-full py-2 text-xs" style={{ border: `1px solid ${LINE}`, color: INK }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* studio modal */}
            {/* capture screen — full-screen camera */}
            {showStudio && studioStep === 'capture' && (
              <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
                <div className="relative flex-1 overflow-hidden">
                  {cameraActive ? (
                    <video ref={liveVideoRef} autoPlay muted playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
                  ) : studioVideoUrl ? (
                    <video src={studioVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                  ) : cameraFailed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <p className="text-white text-xs kicker" style={{ opacity: 0.5 }}>Tap to film or choose a video</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white text-xs kicker" style={{ opacity: 0.6 }}>Starting camera\u2026</p>
                    </div>
                  )}

                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                    <button onClick={() => { stopCameraStream(); stopRecording(); setShowStudio(false); resetStudio(); }}
                      className="rounded-full p-2" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setShowSoundPicker(true)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] kicker text-white"
                      style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <Music className="w-3 h-3" /> {studioMusic}
                    </button>
                  </div>

                  {isRecording && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs kicker flex items-center gap-1.5" style={{ background: 'rgba(220,50,50,0.85)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fff' }} />
                      {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-12 py-7">
                  {cameraActive ? (
                    <>
                      <div className="w-11" />
                      <button onClick={isRecording ? stopRecording : startRecording} className="rounded-full flex items-center justify-center"
                        style={{ width: 72, height: 72, border: '4px solid white', background: 'transparent' }}>
                        <span style={{
                          width: isRecording ? 26 : 56, height: isRecording ? 26 : 56,
                          background: '#E23D4A', borderRadius: isRecording ? 6 : 9999, transition: 'all .15s ease',
                        }} />
                      </button>
                      <button onClick={flipCamera} className="rounded-full p-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : studioVideoUrl ? (
                    <>
                      <button onClick={retakeCover} className="rounded-full p-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <X className="w-6 h-6 text-white" />
                      </button>
                      <button onClick={() => setStudioStep('edit')} className="rounded-full p-4" style={{ background: ROSE }}>
                        <Check className="w-7 h-7 text-white" />
                      </button>
                    </>
                  ) : cameraFailed ? (
                    <>
                      <div className="w-11" />
                      <button onClick={() => videoFileRef.current?.click()} className="rounded-full flex items-center justify-center"
                        style={{ width: 72, height: 72, border: '4px solid white', background: 'transparent' }}>
                        <span style={{ width: 56, height: 56, background: '#E23D4A', borderRadius: 9999 }} />
                      </button>
                      <button onClick={() => startCamera()} className="rounded-full p-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <p className="text-white text-xs kicker" style={{ opacity: 0.5 }}>Loading camera\u2026</p>
                  )}
                </div>
              </div>
            )}

            {/* sound picker */}
            {showSoundPicker && (
              <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSoundPicker(false)}>
                <div className="w-full max-w-md bg-white rounded-t-2xl p-5 fade-in" onClick={e => e.stopPropagation()}>
                  <p className="serif text-lg mb-3" style={{ color: INK }}>Choose a sound</p>
                  <div className="flex flex-col gap-1 mb-3">
                    {MUSIC_OPTIONS.map(m => (
                      <button key={m} onClick={() => { setStudioMusic(m); setShowSoundPicker(false); }} className="text-left py-2.5 text-sm"
                        style={{ color: studioMusic === m ? ROSE : INK, fontWeight: studioMusic === m ? 600 : 400 }}>{m}</button>
                    ))}
                  </div>
                  <p className="text-[10px] kicker" style={{ opacity: 0.45 }}>Uploading your own sound isn't supported yet.</p>
                </div>
              </div>
            )}

            {/* edit screen */}
            {showStudio && studioStep === 'edit' && (
              <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: 'rgba(43,32,36,0.35)' }}>
                <div className="w-full max-w-sm bg-white rounded-lg p-6 max-h-[85%] overflow-y-auto dotblogs-scroll fade-in">
                  <div className="flex items-center justify-between mb-5">
                    <p className="serif text-xl" style={{ color: INK }}>Edit post</p>
                    <button onClick={() => { setShowStudio(false); resetStudio(); }}><X className="w-5 h-5" /></button>
                  </div>

                  <div className="relative rounded-lg overflow-hidden mb-3" style={{ height: '190px', border: `1px solid ${LINE}`, background: studioThumbnail || processingVideo ? '#000' : BLUSH_SOFT }}>
                    {processingVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <p className="text-[11px] kicker" style={{ color: '#fff', opacity: 0.8 }}>Adding your video\u2026</p>
                      </div>
                    ) : studioThumbnail ? (
                      <img src={studioThumbnail} className="w-full h-full object-cover" style={{ filter: FILTER_CSS[studioFilter] }} />
                    ) : studioVideoUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                        <VideoIcon className="w-8 h-8" style={{ color: 'rgba(43,32,36,0.35)' }} />
                        <p className="text-[10px] kicker" style={{ opacity: 0.5 }}>Video attached, no cover yet</p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                        <ImageIcon className="w-8 h-8" style={{ color: 'rgba(43,32,36,0.3)' }} />
                        <p className="text-[10px] kicker" style={{ opacity: 0.4 }}>No cover yet</p>
                      </div>
                    )}
                    {studioCaption && studioThumbnail && (
                      <div className="absolute bottom-2 left-2 right-2 text-center px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.45)' }}>
                        <p className="text-white text-xs" style={{ fontFamily: studioCaptionFont === 'serif' ? "'Bodoni Moda', serif" : "'Poppins', sans-serif" }}>{studioCaption}</p>
                      </div>
                    )}
                  </div>

                  {processingVideo ? null : studioVideoUrl && studioThumbnail ? (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] kicker" style={{ color: ROSE }}>Video attached \u2014 cover captured from your clip</span>
                      <button onClick={retakeCover} className="flex items-center gap-1 text-[10px] kicker" style={{ color: INK, opacity: 0.6 }}>
                        <RotateCcw className="w-3 h-3" /> Retake
                      </button>
                    </div>
                  ) : studioVideoUrl && !studioThumbnail ? (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] kicker" style={{ color: ROSE }}>Video attached</span>
                        <button onClick={retakeCover} className="flex items-center gap-1 text-[10px] kicker" style={{ color: INK, opacity: 0.6 }}>
                          <RotateCcw className="w-3 h-3" /> Retake
                        </button>
                      </div>
                      <button onClick={() => thumbnailFileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] kicker"
                        style={{ border: `1px solid ${LINE}`, color: INK }}>
                        <ImageIcon className="w-3.5 h-3.5" /> Upload a cover photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => thumbnailFileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] kicker"
                        style={{ border: `1px solid ${LINE}`, color: INK }}>
                        <ImageIcon className="w-3.5 h-3.5" /> Upload photo
                      </button>
                      <button onClick={() => { setStudioStep('capture'); startCamera(); }} className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] kicker"
                        style={{ border: `1px solid ${LINE}`, color: INK }}>
                        <VideoIcon className="w-3.5 h-3.5" /> Film video
                      </button>
                    </div>
                  )}
                  {studioThumbnail && !studioVideoUrl && !processingVideo && (
                    <button onClick={clearCoverOnly} className="flex items-center gap-1 text-[10px] kicker mb-3" style={{ color: INK, opacity: 0.5 }}>
                      <RotateCcw className="w-3 h-3" /> Choose a different photo
                    </button>
                  )}

                  <input value={studioTitle} onChange={e => setStudioTitle(e.target.value)} placeholder="What's this post about?"
                    className="w-full underline-input text-sm py-2 outline-none mb-5" />

                  <p className="kicker mb-2" style={{ color: GOLD }}>Category</p>
                  <div className="flex gap-2 flex-wrap mb-5">
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <button key={c} onClick={() => setStudioCategory(c)} className="px-3 py-1.5 rounded-full text-[10px] kicker"
                        style={studioCategory === c ? { background: ROSE, color: '#fff' } : { background: BLUSH_SOFT, color: INK, border: `1px solid ${LINE}` }}>{c}</button>
                    ))}
                  </div>

                  <p className="kicker mb-2" style={{ color: GOLD }}>Caption text <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(shown over your post)</span></p>
                  <input value={studioCaption} onChange={e => setStudioCaption(e.target.value)} placeholder="Add a caption\u2026"
                    className="w-full underline-input text-sm py-2 outline-none mb-2" style={{ fontFamily: studioCaptionFont === 'serif' ? "'Bodoni Moda', serif" : "'Poppins', sans-serif" }} />
                  <div className="flex gap-2 mb-5">
                    <button onClick={() => setStudioCaptionFont('sans')} className="px-3 py-1.5 rounded-full text-[10px] kicker"
                      style={studioCaptionFont === 'sans' ? { background: ROSE, color: '#fff' } : { background: BLUSH_SOFT, color: INK, border: `1px solid ${LINE}` }}>Clean sans</button>
                    <button onClick={() => setStudioCaptionFont('serif')} className="px-3 py-1.5 rounded-full text-[10px]"
                      style={{ fontFamily: "'Bodoni Moda', serif", ...(studioCaptionFont === 'serif' ? { background: ROSE, color: '#fff' } : { background: BLUSH_SOFT, color: INK, border: `1px solid ${LINE}` }) }}>
                      Elegant serif
                    </button>
                  </div>

                  <p className="kicker mb-2" style={{ color: GOLD }}>Filter</p>
                  <div className="flex gap-2 flex-wrap mb-5">
                    {FILTER_OPTIONS.map(f => (
                      <button key={f} onClick={() => setStudioFilter(f)} className="px-3 py-1.5 rounded-full text-[10px] kicker"
                        style={studioFilter === f ? { background: ROSE, color: '#fff' } : { background: BLUSH_SOFT, color: INK, border: `1px solid ${LINE}` }}>{f}</button>
                    ))}
                  </div>

                  {studioVideoUrl && studioDuration > 0 && (
                    <>
                      <p className="kicker mb-2" style={{ color: GOLD }}>Trim <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>({studioTrimStart.toFixed(1)}s \u2013 {studioTrimEnd.toFixed(1)}s of {studioDuration.toFixed(1)}s)</span></p>
                      <div className="mb-2">
                        <p className="text-[9px] mb-1" style={{ opacity: 0.5 }}>Start</p>
                        <input type="range" min={0} max={studioDuration} step={0.1} value={studioTrimStart}
                          onChange={e => setStudioTrimStart(Math.min(Number(e.target.value), studioTrimEnd - 0.2))}
                          className="w-full" />
                      </div>
                      <div className="mb-5">
                        <p className="text-[9px] mb-1" style={{ opacity: 0.5 }}>End</p>
                        <input type="range" min={0} max={studioDuration} step={0.1} value={studioTrimEnd}
                          onChange={e => setStudioTrimEnd(Math.max(Number(e.target.value), studioTrimStart + 0.2))}
                          className="w-full" />
                      </div>
                    </>
                  )}

                  <p className="kicker mb-2" style={{ color: GOLD }}>Sound <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(a vibe tag \u2014 not mixed into the file)</span></p>
                  <select value={studioMusic} onChange={e => setStudioMusic(e.target.value)} className="w-full underline-input text-xs py-2 mb-6 outline-none">
                    {MUSIC_OPTIONS.map(m => <option key={m}>{m}</option>)}
                  </select>

                  <button onClick={publishVideo} className="mag-btn w-full rounded-full py-3">Publish</button>
                </div>
              </div>
            )}

            {/* bottom nav */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white flex items-center z-20"
                 style={{ borderTop: `1px solid ${LINE}`, boxShadow: '0 -4px 16px rgba(43,32,36,0.06)' }}>
              <button onClick={() => setActiveTab('home')} className="flex-1 flex flex-col items-center gap-1 py-3">
                <HomeIcon className="w-6 h-6" style={{ color: activeTab === 'home' ? ROSE : INK, opacity: activeTab === 'home' ? 1 : 0.35 }} />
                <span className="kicker" style={{ fontSize: '8px', color: activeTab === 'home' ? ROSE : INK, opacity: activeTab === 'home' ? 1 : 0.35 }}>Home</span>
              </button>
              <button onClick={() => setActiveTab('discover')} className="flex-1 flex flex-col items-center gap-1 py-3">
                <Compass className="w-6 h-6" style={{ color: activeTab === 'discover' ? ROSE : INK, opacity: activeTab === 'discover' ? 1 : 0.35 }} />
                <span className="kicker" style={{ fontSize: '8px', color: activeTab === 'discover' ? ROSE : INK, opacity: activeTab === 'discover' ? 1 : 0.35 }}>Discover</span>
              </button>
              <button onClick={() => { resetStudio(); setShowStudio(true); startCamera('user'); }} className="flex-1 flex items-center justify-center py-2">
                <div className="rounded-lg px-6 py-2" style={{ background: ROSE }}>
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
              </button>
              <button onClick={() => setActiveTab('profile')} className="flex-1 flex flex-col items-center gap-1 py-3">
                <UserIcon className="w-6 h-6" style={{ color: activeTab === 'profile' ? ROSE : INK, opacity: activeTab === 'profile' ? 1 : 0.35 }} />
                <span className="kicker" style={{ fontSize: '8px', color: activeTab === 'profile' ? ROSE : INK, opacity: activeTab === 'profile' ? 1 : 0.35 }}>Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
