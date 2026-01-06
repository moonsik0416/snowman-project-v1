
import React, { useState } from 'react';
import { SnowmanEntry } from '../types';
import { X, Calendar, MapPin, Image as ImageIcon, Camera } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface SnowmanDetailProps {
  snowman: SnowmanEntry | null;
  onClose: () => void;
}

const rarityMap: Record<string, string> = {
  Common: '일반',
  Uncommon: '희귀',
  Rare: '레어',
  Legendary: '전설',
  Mythical: '신화',
};

export const SnowmanDetail: React.FC<SnowmanDetailProps> = ({ snowman, onClose }) => {
  const [viewMode, setViewMode] = useState<'photo' | 'sticker'>('photo');

  if (!snowman) return null;

  const statsData = [
    { subject: '창의성', A: snowman.stats.creativity, fullMark: 100 },
    { subject: '동글함', A: snowman.stats.roundness, fullMark: 100 },
    { subject: '장식', A: snowman.stats.accessories, fullMark: 100 },
    { subject: '여유', A: snowman.stats.chillFactor, fullMark: 100 },
    { subject: '내구도', A: snowman.stats.durability, fullMark: 100 },
  ];

  const stickerSrc = snowman.stickerUrl ? `data:image/png;base64,${snowman.stickerUrl}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2D3354] w-full max-w-sm rounded-[32px] border-2 border-white overflow-hidden shadow-2xl flex flex-col relative text-white animate-in zoom-in-95 duration-300 font-serif">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full h-64 bg-white/5 relative flex items-center justify-center overflow-hidden">
          <img 
            src={viewMode === 'photo' ? snowman.imageUrl : (stickerSrc || snowman.imageUrl)} 
            alt={snowman.name} 
            className={`w-full h-full transition-all duration-500 ${viewMode === 'photo' ? 'object-cover' : 'object-contain p-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}
          />
          
          {stickerSrc && (
            <div className="absolute bottom-4 flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 font-sans">
              <button 
                onClick={() => setViewMode('photo')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'photo' ? 'bg-white text-[#2D3354]' : 'text-white/50'}`}
              >
                실사
              </button>
              <button 
                onClick={() => setViewMode('sticker')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'sticker' ? 'bg-white text-[#2D3354]' : 'text-white/50'}`}
              >
                스티커
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1 font-sans">
              <span className="text-[10px] font-black border border-white/40 px-2 py-0.5 rounded uppercase tracking-widest text-white/60">
                {rarityMap[snowman.rarity] || snowman.rarity}
              </span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                TYPE: {snowman.type}
              </span>
            </div>
            <h2 className="text-4xl font-title tracking-tight leading-tight">{snowman.name}</h2>
          </div>

          <p className="text-base text-white/80 leading-relaxed mb-6 italic handwritten">
            "{snowman.description}"
          </p>

          <div className="h-44 w-full bg-white/5 rounded-2xl mb-6 border border-white/10 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', fontFamily: 'Pretendard' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="능력치"
                  dataKey="A"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fill="#ffffff"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 font-sans">
                TMI TRIVIA
              </h4>
              <p className="text-base text-white/90 leading-relaxed">
                {snowman.funFact}
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-widest pt-4 font-sans">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(snowman.capturedAt).toLocaleDateString('ko-KR')} 발견
              </div>
              <div>야생의 조우</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
