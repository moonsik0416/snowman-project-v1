
import React, { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, Book, ArrowRight, UserPlus, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';
import { SnowmanEntry, User } from './types';
import { analyzeSnowman, generateSnowmanSticker } from './services/geminiService';
import SnowmanCard from './components/SnowmanCard';
import { SnowmanDetail } from './components/Snowmandex';

const BASE_STORAGE_KEY = 'snowmanDex_v2_nick_';
const USERS_LIST_KEY = 'snowmanDex_v2_all_users';

// 눈사람 아바타 컴포넌트
const SnowmanAvatar = ({ className, seed, size = "small" }: { className?: string, seed?: string, size?: "small" | "large" }) => {
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-purple-500'];
  const colorIndex = seed ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
  const bgColor = colors[colorIndex];
  
  const iconSize = size === "large" ? "w-16 h-16 mb-6" : "w-10 h-10";

  return (
    <div className={`${className} ${iconSize} ${bgColor} flex items-center justify-center rounded-full overflow-hidden border border-white/20 shadow-inner relative`}>
      <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] drop-shadow-md">
        {/* Body */}
        <circle cx="50" cy="72" r="22" fill="white" />
        <circle cx="50" cy="40" r="16" fill="white" />
        {/* Eyes */}
        <circle cx="44" cy="38" r="1.8" fill="#2D3354" />
        <circle cx="56" cy="38" r="1.8" fill="#2D3354" />
        {/* Carrot Nose */}
        <path d="M50 43 L64 43" stroke="#FF8A3D" strokeWidth="3" strokeLinecap="round" />
        {/* Buttons */}
        <circle cx="50" cy="62" r="1.5" fill="#2D3354" opacity="0.3" />
        <circle cx="50" cy="72" r="1.5" fill="#2D3354" opacity="0.3" />
        {/* Shadow floor */}
        <ellipse cx="50" cy="92" rx="20" ry="4" fill="#000" opacity="0.1" />
      </svg>
    </div>
  );
};

// 메인 로고용 SVG
const Logo = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto mb-4 drop-shadow-2xl">
    <circle cx="50" cy="75" r="22" fill="white" />
    <circle cx="50" cy="45" r="16" fill="white" />
    <path d="M46 42 Q50 38 54 42" stroke="#2D3354" strokeWidth="2" fill="none" />
    <circle cx="44" cy="44" r="1.5" fill="#2D3354" />
    <circle cx="56" cy="44" r="1.5" fill="#2D3354" />
    <path d="M50 48 L65 48" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<SnowmanEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSnowman, setSelectedSnowman] = useState<SnowmanEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_LIST_KEY);
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers([]);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const savedEntries = localStorage.getItem(`${BASE_STORAGE_KEY}${user.id}`);
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch (e) {
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    }
  }, [user]);

  const handleCreateUserSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: newName.trim(),
      email: `${Date.now()}@snowdex.com`,
      photoUrl: '' // 이제 컴포넌트로 렌더링하므로 빈 문자열
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedUsers));
    setUser(newUser);
    setIsCreating(false);
    setNewName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await processSnowman(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSnowman = async (base64Image: string) => {
    if (!user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeSnowman(base64Image);
      const stickerBase64 = await generateSnowmanSticker(base64Image);
      
      const newEntry: SnowmanEntry = {
        ...analysis,
        id: Date.now().toString(),
        imageUrl: base64Image,
        stickerUrl: stickerBase64,
        capturedAt: Date.now()
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(`${BASE_STORAGE_KEY}${user.id}`, JSON.stringify(updatedEntries));
      setSelectedSnowman(newEntry);
    } catch (err) {
      setError("눈사람 분석에 실패했습니다. 사진 품질을 확인해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1c2c] flex items-center justify-center p-6 font-sans text-white">
        <div className="w-full max-w-sm text-center animate-in fade-in zoom-in duration-500">
          {!isCreating ? (
            <>
              <Logo />
              <h1 className="text-4xl font-title mb-2 tracking-tighter">SNOWDEX</h1>
              <p className="text-white/60 mb-10 handwritten text-xl">당신만의 특별한 눈사람을 수집하세요</p>
              
              <div className="space-y-3">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUser(u)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98]"
                  >
                    <SnowmanAvatar seed={u.name} />
                    <span className="font-bold text-white text-lg">{u.name}</span>
                    <ArrowRight className="ml-auto opacity-30 text-white" size={18} />
                  </button>
                ))}
                
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-white text-[#1a1c2c] font-black p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98]"
                >
                  <UserPlus size={20} />
                  새로운 도감 만들기
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
              <SnowmanAvatar seed={newName || "new"} size="large" className="mx-auto" />
              <h2 className="text-2xl font-title text-white mb-2">모험가 등록</h2>
              <p className="text-white/60 mb-6 text-sm font-sans">도감에 표시될 이름을 입력해주세요.</p>
              
              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="예: 눈사람 마스터"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-white/50 transition-colors text-center font-bold text-lg font-sans"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-white/5 text-white font-bold p-3 rounded-xl hover:bg-white/10 transition-colors font-sans"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-white text-[#1a1c2c] font-black p-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-sans"
                  >
                    <Check size={18} />
                    시작하기
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans bg-[#1a1c2c] text-white">
      <header className="p-6 flex items-center justify-between sticky top-0 z-40 bg-[#1a1c2c]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
            <Book className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-title text-xl leading-none tracking-tight">SNOWDEX</h1>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">{user.name}의 수집 목록</p>
          </div>
        </div>
        <button onClick={() => setUser(null)} className="p-2 opacity-30 hover:opacity-100 hover:text-red-400 transition-all">
          <LogOut size={20}/>
        </button>
      </header>

      <div className="px-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex justify-around shadow-inner">
          <div className="text-center">
            <p className="text-[10px] opacity-40 font-bold uppercase mb-1 tracking-widest">수집됨</p>
            <p className="text-3xl font-title">{entries.length}</p>
          </div>
          <div className="w-px h-10 bg-white/10 my-auto" />
          <div className="text-center">
            <p className="text-[10px] opacity-40 font-bold uppercase mb-1 tracking-widest">랭크</p>
            <p className="text-2xl font-title text-indigo-300">
              {entries.length >= 20 ? '갓' : entries.length >= 10 ? '베테랑' : entries.length >= 5 ? '익스퍼트' : '루키'}
            </p>
          </div>
        </div>
      </div>

      <main className="px-6 grid grid-cols-3 gap-4">
        {entries.map(snowman => (
          <div key={snowman.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SnowmanCard snowman={snowman} onClick={() => setSelectedSnowman(snowman)} />
          </div>
        ))}
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all group"
        >
          <Camera size={28} className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all text-white" />
          <span className="text-[10px] font-bold opacity-20 uppercase tracking-tighter group-hover:opacity-100">발견하기</span>
        </button>
      </main>

      {entries.length === 0 && !isAnalyzing && (
        <div className="px-10 py-12 text-center">
          <p className="handwritten text-xl text-white/40 leading-relaxed">
            아직 수집된 눈사람이 없네요.<br/>
            길가에 서 있는 눈사람을 찍어보세요!
          </p>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 bg-[#1a1c2c]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping opacity-20"><Sparkles className="w-20 h-20 text-white" /></div>
            <Loader2 className="w-20 h-20 animate-spin text-white opacity-80" />
          </div>
          <h2 className="text-3xl font-title mb-3 tracking-tight">정밀 스캔 중...</h2>
          <p className="handwritten text-white/60 text-xl">눈사람의 영혼을 읽어 도감에 기록하고 있어요.</p>
        </div>
      )}

      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-40">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full max-w-sm h-16 bg-white text-[#1a1c2c] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3 font-black text-xl transition-all active:scale-90 disabled:opacity-50 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
        >
          <Camera size={26} />
          눈사람 발견하기
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {error && (
        <div className="fixed top-20 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-[60] animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {selectedSnowman && (
        <SnowmanDetail 
          snowman={selectedSnowman} 
          onClose={() => setSelectedSnowman(null)} 
        />
      )}
    </div>
  );
};

export default App;
