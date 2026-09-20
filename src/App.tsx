import React, { useState } from 'react';
import { MORPHEMES, MORPHEME_COLORS, getMergeResult, type Morpheme, type MergeResult } from './data/morphemes';

const A = '/assets';

// ─── SVG icons (inlined for crisp renders) ────────────────────────────────────
function IconSparkles({ color = '#ffc174', size = 13 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1L7.5 5.5L12 6.5L7.5 7.5L6.5 12L5.5 7.5L1 6.5L5.5 5.5L6.5 1Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function IconForge({ color = '#ffc174' }: { color?: string }) {
  return <img src={`${A}/e7cf0.svg`} alt="" style={{ width: 18, height: 18 }} />;
}
function IconDisc({ color = '#d8c3ad' }: { color?: string }) {
  return <img src={`${A}/3b697.svg`} alt="" style={{ width: 20, height: 20 }} />;
}
function IconJournal({ color = '#d8c3ad' }: { color?: string }) {
  return <img src={`${A}/96f8d.svg`} alt="" style={{ width: 20, height: 15 }} />;
}
function IconStar() {
  return <img src={`${A}/3494f.svg`} alt="" style={{ width: 13, height: 13 }} />;
}
function IconArrow() {
  return <img src={`${A}/1ec86.svg`} alt="" style={{ width: 11, height: 11 }} />;
}
function EmblemImg() {
  return <img src={`${A}/a9c75.svg`} alt="Morpheme Alchemy" style={{ width: 32, height: 32 }} />;
}

type View = 'SPLASH' | 'FORGE' | 'RESULT' | 'DISCOVERIES' | 'JOURNAL';

export default function App() {
  const [view, setView] = useState<View>('SPLASH');
  const [activeTab, setActiveTab] = useState<'FORGE' | 'DISCOVERIES' | 'JOURNAL'>('FORGE');
  const [discoveries, setDiscoveries] = useState<string[]>(['REACTION', 'DETRACTION', 'RETRACTION', 'DEACTIVE', 'UNAPPLE', 'UNACT', 'RETRACT']);
  const [crucibleMorphemes, setCrucibleMorphemes] = useState<Morpheme[]>([]);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<'ALL' | 'PREFIX' | 'ROOT' | 'SUFFIX'>('ALL');

  function goToTab(tab: 'FORGE' | 'DISCOVERIES' | 'JOURNAL') {
    setActiveTab(tab);
    setView(tab as View);
  }

  function handleMerge() {
    if (crucibleMorphemes.length < 2) return;
    const result = getMergeResult(crucibleMorphemes);
    setMergeResult(result);
    setView('RESULT');
    if (result.type === 'VALID' && !discoveries.includes(result.word)) {
      setDiscoveries(prev => [...prev, result.word]);
    }
  }

  function handleContinue() {
    setCrucibleMorphemes([]);
    setMergeResult(null);
    setView('FORGE');
    setActiveTab('FORGE');
  }

  function addToCrucible(m: Morpheme) {
    if (crucibleMorphemes.find(c => c.id === m.id)) return;
    if (crucibleMorphemes.length >= 3) return;
    setCrucibleMorphemes(prev => [...prev, m]);
  }

  function removeFromCrucible(id: string) {
    setCrucibleMorphemes(prev => prev.filter(m => m.id !== id));
  }

  const filteredMorphemes = MORPHEMES.filter(m =>
    collectionFilter === 'ALL' || m.type === collectionFilter
  );

  if (view === 'SPLASH') {
    return <SplashView onStart={() => { setView('FORGE'); setActiveTab('FORGE'); }} />;
  }

  if (view === 'RESULT' && mergeResult) {
    return (
      <ResultView
        result={mergeResult}
        morphemes={crucibleMorphemes}
        discCount={discoveries.length}
        onContinue={handleContinue}
        onTabChange={goToTab}
        activeTab={activeTab}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#10131b] text-[#e0e2ed] flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans:Regular']">
      <AppHeader discCount={discoveries.length} />

      <main className="flex-1 overflow-y-auto pt-16 pb-16">
        {activeTab === 'FORGE' && (
          <ForgeView
            crucible={crucibleMorphemes}
            morphemes={filteredMorphemes}
            filter={collectionFilter}
            onFilterChange={setCollectionFilter}
            onAddToCrucible={addToCrucible}
            onRemoveFromCrucible={removeFromCrucible}
            onMerge={handleMerge}
          />
        )}
        {activeTab === 'DISCOVERIES' && (
          <DiscoveriesView
            discoveries={discoveries}
            onForgeWith={(word) => { setActiveTab('FORGE'); setView('FORGE'); }}
          />
        )}
        {activeTab === 'JOURNAL' && <JournalView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={goToTab} discCount={discoveries.length} />
    </div>
  );
}

// ─── App Header ───────────────────────────────────────────────────────────────
function AppHeader({ discCount }: { discCount: number }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-[12px] bg-[rgba(16,19,27,0.8)] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.35)]">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <EmblemImg />
          <div className="font-['Outfit:SemiBold'] text-[18px] tracking-[0.45px] leading-tight">
            <div>Morpheme</div>
            <div>Alchemy</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(39,42,50,0.8)] relative shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
            <IconStar />
            <div className="font-['Outfit:Medium'] text-[11px] tracking-[1.54px] text-[#ffc174] leading-tight">
              <div>{discCount}</div>
              <div>Discovered</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ activeTab, onTabChange, discCount }: {
  activeTab: string; onTabChange: (t: 'FORGE' | 'DISCOVERIES' | 'JOURNAL') => void; discCount: number;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-[12px] bg-[rgba(11,14,22,0.85)] shadow-[0px_-4px_24px_0px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-16 px-5">
        <NavBtn active={activeTab === 'FORGE'} onClick={() => onTabChange('FORGE')} label="FORGE">
          <IconForge color={activeTab === 'FORGE' ? '#ffc174' : '#d8c3ad'} />
        </NavBtn>
        <NavBtn active={activeTab === 'DISCOVERIES'} onClick={() => onTabChange('DISCOVERIES')} label="DISCOVERIES" badge={discCount}>
          <IconDisc color={activeTab === 'DISCOVERIES' ? '#ffc174' : '#d8c3ad'} />
        </NavBtn>
        <NavBtn active={activeTab === 'JOURNAL'} onClick={() => onTabChange('JOURNAL')} label="JOURNAL">
          <IconJournal color={activeTab === 'JOURNAL' ? '#ffc174' : '#d8c3ad'} />
        </NavBtn>
      </div>
    </nav>
  );
}

function NavBtn({ active, onClick, label, children, badge }: {
  active: boolean; onClick: () => void; label: string; children: React.ReactNode; badge?: number;
}) {
  return (
    <button onClick={onClick} className="flex flex-col gap-1 items-center justify-center min-w-[56px] min-h-[44px] relative">
      <div className="relative">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-[#f59e0b] text-[#613b00] font-['Outfit:Bold'] text-[9px] w-4 h-4 rounded-full flex items-center justify-center pb-px">
            {badge}
          </span>
        )}
      </div>
      <span className={`font-['Outfit:Medium'] text-[11px] tracking-[0.55px] uppercase ${active ? 'text-[#ffc174]' : 'text-[#d8c3ad]'}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Splash View ──────────────────────────────────────────────────────────────
function SplashView({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh bg-[#10131b] flex flex-col items-center justify-between px-5 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(109,17,173,0.6) 0%, rgba(245,158,11,0.3) 50%, transparent 70%)' }} />
      </div>

      <div className="flex flex-col items-center pt-8 relative z-10">
        <div className="w-40 h-40 rounded-2xl bg-[#1c1f28] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <img src={`${A}/a9c75.svg`} alt="Morpheme Alchemy" className="w-24 h-24" />
        </div>
        <h1 className="font-['Outfit:Bold'] text-[32px] tracking-[4px] text-center uppercase text-[#e0e2ed] leading-tight mb-3">
          Morpheme<br />Alchemy
        </h1>
        <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-center text-[15px]">
          Discover how English words are built.
        </p>
      </div>

      <div className="w-full relative z-10">
        {/* Linguistic Crucible preview */}
        <div className="bg-[rgba(28,31,40,0.9)] rounded-2xl p-4 mb-8 border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-['Outfit:SemiBold'] text-[#d8c3ad] text-[11px] tracking-[0.55px] uppercase">Linguistic Crucible</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)]">
              <IconStar />
              <span className="font-['Outfit:SemiBold'] text-[#ffc174] text-[10px] tracking-[0.5px] uppercase">Preview</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {[
              { text: 'RE-', type: 'PREFIX', label: 'PREFIX' },
              { text: 'ACT', type: 'ROOT', label: 'ROOT' },
              { text: 'ION', type: 'SUFFIX', label: 'SUFFIX' },
            ].map((m, i) => {
              const colors = MORPHEME_COLORS[m.type as keyof typeof MORPHEME_COLORS];
              return (
                <React.Fragment key={m.text}>
                  <div className="flex-1 bg-[rgba(39,42,50,0.9)] rounded-lg p-2 text-center relative overflow-hidden"
                    style={{ boxShadow: `inset 0 0 0 1px ${colors.border}` }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: colors.dot }} />
                    <div className={`font-['Outfit:SemiBold'] text-[15px] tracking-[0.75px]`} style={{ color: colors.dot }}>{m.text}</div>
                    <div className={`font-['Outfit:Regular'] text-[9px] tracking-[0.45px] uppercase`} style={{ color: colors.dot }}>{m.label}</div>
                  </div>
                  {i < 2 && <span className="text-[#d8c3ad] text-sm">+</span>}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[12px]">SYNTHESIS →</span>
            <span className="font-['Outfit:Bold'] text-[#ffc174] text-[14px] tracking-[1px]">REACTION</span>
          </div>
          <p className="text-center font-['Plus_Jakarta_Sans:Italic'] text-[#d8c3ad] text-[11px] mt-2">
            "Latin re- (again, back) + agere (to drive, do) + -tio (state of)"
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full h-14 rounded-2xl font-['Outfit:Bold'] text-[18px] tracking-[1.8px] uppercase text-[#472a00] mb-4"
          style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ffc174 50%, #f59e0b 100%)' }}
        >
          Start Exploring ⊙
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <IconStar />
            <span className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px]">7 discoveries made</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#54ddfc] shadow-[0_0_8px_#54ddfc]" />
            <span className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px]">3 new morphemes awaiting discovery</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Morpheme Card ────────────────────────────────────────────────────────────
function MorphemeCardLarge({ morpheme, onRemove }: { morpheme: Morpheme; onRemove: () => void }) {
  const c = MORPHEME_COLORS[morpheme.type];
  return (
    <div
      className="relative backdrop-blur-[12px] bg-[rgba(39,42,50,0.9)] rounded-2xl flex flex-col items-center justify-between p-2.5 cursor-pointer active:scale-95 transition-transform"
      style={{
        width: 96, height: 96,
        boxShadow: `inset 0px 1px 0px 0px rgba(255,255,255,0.18), inset 0px 0px 0px 1px ${c.border}`,
      }}
      onClick={onRemove}
    >
      <div className="flex items-center justify-between w-full">
        <span className="rounded-full shadow-[0_0_8px] w-2 h-2 shrink-0" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
        <span className="font-['Outfit:SemiBold'] text-[9px] tracking-[0.9px] uppercase" style={{ color: c.text }}>{morpheme.type}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-['Outfit:Bold'] text-[20px] tracking-[2px] text-[#e0e2ed]">{morpheme.text}</span>
        <span className="font-['Plus_Jakarta_Sans:Medium'] text-[10px] tracking-[0.25px]" style={{ color: c.text + 'cc' }}>{morpheme.meaning}</span>
      </div>
      <div className="h-0.5 w-6 rounded-full" style={{ background: c.divider }} />
    </div>
  );
}

function MorphemeCardSmall({ morpheme, onSelect, selected }: { morpheme: Morpheme; onSelect: () => void; selected: boolean }) {
  const c = MORPHEME_COLORS[morpheme.type];
  return (
    <button
      onClick={onSelect}
      disabled={selected}
      className={`relative backdrop-blur-[6px] rounded-xl flex flex-col items-center justify-between p-2 transition-all ${selected ? 'opacity-40' : 'active:scale-95'}`}
      style={{
        width: 80, height: 80, flexShrink: 0,
        background: selected ? 'rgba(11,14,22,0.5)' : 'rgba(39,42,50,0.7)',
        boxShadow: selected ? 'none' : `inset 0px 1px 0px 0px rgba(255,255,255,0.12), inset 0px 0px 0px 1px ${c.border.replace('0.45', '0.3')}`,
      }}
    >
      <div className="flex items-center justify-between w-full">
        <span className="rounded-full w-1.5 h-1.5" style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }} />
        <span className="font-['Outfit:Medium'] text-[8px] tracking-[0.14px] uppercase" style={{ color: c.text }}>{morpheme.type}</span>
      </div>
      <span className="font-['Outfit:Bold'] text-[16px] tracking-[0.14px] text-[#e0e2ed]">{morpheme.text}</span>
      <span className="font-['Plus_Jakarta_Sans:Regular'] text-[9px] text-[#d8c3ad] text-center tracking-[0.14px] truncate w-full">{morpheme.meaning}</span>
    </button>
  );
}

// ─── Forge View ───────────────────────────────────────────────────────────────
function ForgeView({ crucible, morphemes, filter, onFilterChange, onAddToCrucible, onRemoveFromCrucible, onMerge }: {
  crucible: Morpheme[];
  morphemes: Morpheme[];
  filter: string;
  onFilterChange: (f: 'ALL' | 'PREFIX' | 'ROOT' | 'SUFFIX') => void;
  onAddToCrucible: (m: Morpheme) => void;
  onRemoveFromCrucible: (id: string) => void;
  onMerge: () => void;
}) {
  const selectedIds = new Set(crucible.map(m => m.id));

  return (
    <div className="flex flex-col min-h-full">
      {/* Crucible Zone */}
      <div className="relative flex flex-col items-center pt-4 pb-2 overflow-hidden" style={{ minHeight: 360 }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-72 h-72 rounded-full blur-[32px] opacity-20"
            style={{ background: 'linear-gradient(45deg, rgba(109,17,173,0.2) 0%, rgba(245,158,11,0.1) 50%, rgba(41,193,223,0.15) 100%)' }} />
        </div>
        {/* Astrolabe background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <img src={`${A}/72837.svg`} alt="" style={{ width: 320, height: 320 }} />
        </div>

        {/* Ready to merge indicator */}
        {crucible.length >= 2 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(11,14,22,0.8)] backdrop-blur-sm mb-2 relative z-10">
            <IconStar />
            <span className="font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase text-[#ffddb8]">READY TO MERGE</span>
          </div>
        )}
        {crucible.length === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(11,14,22,0.8)] backdrop-blur-sm mb-2 relative z-10">
            <span className="font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase text-[#d8c3ad]">SELECT MORPHEMES BELOW</span>
          </div>
        )}

        {/* Crucible cards */}
        <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full px-4">
          {crucible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              {/* Central focal core */}
              <div className="w-14 h-14 rounded-full bg-[rgba(11,14,22,0.7)] backdrop-blur-[2px] flex items-center justify-center shadow-[inset_0_0_16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]">
                <img src={`${A}/58445.svg`} alt="" style={{ width: 18, height: 18 }} />
              </div>
              <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px] text-center">
                Tap morphemes to add them to the crucible
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Cards in a triangle/row layout */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {crucible.map((m, i) => (
                  <React.Fragment key={m.id}>
                    {i > 0 && (
                      <div className="w-0.5 h-px bg-[rgba(255,193,116,0.4)]" style={{ width: 20, height: 1 }} />
                    )}
                    <MorphemeCardLarge morpheme={m} onRemove={() => onRemoveFromCrucible(m.id)} />
                  </React.Fragment>
                ))}
              </div>
              <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[11px] text-center">
                Tap a card to remove it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drag to merge strip */}
      <div className="flex items-center justify-center gap-2 py-2">
        <IconSparkles />
        <span className="font-['Outfit:SemiBold'] text-[11px] tracking-[2.2px] uppercase text-[rgba(255,193,116,0.9)]">
          DRAG TO MERGE
        </span>
        <IconSparkles />
      </div>

      {/* Merge button */}
      {crucible.length >= 2 && (
        <div className="px-5 pb-2">
          <button
            onClick={onMerge}
            className="w-full h-12 rounded-xl font-['Outfit:SemiBold'] text-[15px] tracking-[2px] uppercase text-[#472a00] transition-all active:scale-95"
            style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ffc174 50%, #f59e0b 100%)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
          >
            ⊙ MERGE
          </button>
        </div>
      )}

      {/* Morpheme Collection Tray */}
      <div className="mx-4 mb-2 rounded-3xl overflow-hidden relative"
        style={{ background: 'rgba(24,27,36,0.75)', backdropFilter: 'blur(20px)', boxShadow: 'inset 0px 1px 0px 0px rgba(255,255,255,0.08), inset 0px 0px 24px 0px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <img src={`${A}/ee9d2.svg`} alt="" style={{ width: 12, height: 12 }} />
            <span className="font-['Outfit:SemiBold'] text-[11px] tracking-[0.55px] uppercase text-[#d8c3ad]">
              MORPHEME<br />COLLECTION
            </span>
          </div>
          {/* Filter chips */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[rgba(11,14,22,0.8)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            {(['ALL', 'PREFIX', 'ROOT', 'SUFFIX'] as const).map(f => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-2.5 py-0.5 rounded-full font-['Outfit:SemiBold'] text-[10px] tracking-[0.14px] transition-colors ${
                  filter === f
                    ? 'bg-[#363942] text-[#e0e2ed] shadow-sm'
                    : 'text-[#d8c3ad]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable morpheme tray */}
        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
            {morphemes.map(m => (
              <MorphemeCardSmall
                key={m.id}
                morpheme={m}
                onSelect={() => onAddToCrucible(m)}
                selected={selectedIds.has(m.id)}
              />
            ))}
            {/* Locked slot */}
            <div className="w-20 h-20 rounded-xl bg-[rgba(11,14,22,0.5)] opacity-50 flex flex-col items-center justify-center gap-1">
              <span className="text-[#d8c3ad] text-lg">🔒</span>
              <span className="font-['Outfit:Medium'] text-[8px] uppercase text-[#d8c3ad] tracking-[0.14px]">SLOT V</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Result View ──────────────────────────────────────────────────────────────
function ResultView({ result, morphemes, discCount, onContinue, onTabChange, activeTab }: {
  result: MergeResult;
  morphemes: Morpheme[];
  discCount: number;
  onContinue: () => void;
  onTabChange: (t: 'FORGE' | 'DISCOVERIES' | 'JOURNAL') => void;
  activeTab: string;
}) {
  const labelColors: Record<string, string> = {
    VALID: 'rgba(245,158,11,0.2)',
    PLAUSIBLE: 'rgba(109,17,173,0.3)',
    PLAYFUL: '#272a32',
    FAILED: 'rgba(28,31,40,0.8)',
  };
  const labelTextColors: Record<string, string> = {
    VALID: '#ffc174',
    PLAUSIBLE: '#e0b6ff',
    PLAYFUL: '#ffc174',
    FAILED: '#d8c3ad',
  };

  return (
    <div className="min-h-dvh bg-[#10131b] text-[#e0e2ed] flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans:Regular']">
      <AppHeader discCount={discCount} />

      <main className="flex-1 overflow-y-auto pt-16 pb-16 px-5">
        <div className="pt-4 pb-4 relative">
          {/* Atmospheric glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[32px] opacity-80"
              style={{
                background: result.type === 'VALID'
                  ? 'linear-gradient(45deg, rgba(245,158,11,0.2) 0%, rgba(41,193,223,0.15) 50%, rgba(109,17,173,0.25) 100%)'
                  : result.type === 'PLAUSIBLE'
                  ? 'linear-gradient(45deg, rgba(109,17,173,0.3) 0%, rgba(245,158,11,0.1) 100%)'
                  : 'linear-gradient(45deg, rgba(255,185,95,0.1) 0%, rgba(224,182,255,0.15) 100%)',
              }}
            />
          </div>

          {/* Main discovery card */}
          <div className="backdrop-blur-[20px] bg-[rgba(24,27,36,0.95)] rounded-xl p-4 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            style={{ boxShadow: result.type === 'VALID' ? '0 20px_50px rgba(0,0,0,0.85), 0 0 0 1px rgba(245,158,11,0.15)' : undefined }}>

            {/* Top gradient line for VALID */}
            {result.type === 'VALID' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-40 blur-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
            )}

            {/* Label badge */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: labelColors[result.type], boxShadow: result.type === 'VALID' ? '0 0 16px rgba(245,158,11,0.25)' : undefined }}>
                <IconStar />
                <span className="font-['Outfit:SemiBold'] text-[11px] tracking-[2.2px] uppercase"
                  style={{ color: labelTextColors[result.type] }}>
                  {result.label}
                </span>
              </div>
            </div>

            {/* Word */}
            <div className="flex flex-col items-center py-1 mb-3">
              {result.type === 'FAILED' ? (
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {morphemes.map((m, i) => {
                    const c = MORPHEME_COLORS[m.type];
                    return (
                      <React.Fragment key={m.id}>
                        <div className="bg-[rgba(39,42,50,0.9)] rounded-xl px-4 py-2 relative"
                          style={{ boxShadow: `inset 0 0 0 1px ${c.border}` }}>
                          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: c.dot }} />
                          <div className="font-['Outfit:SemiBold'] text-[13px] tracking-[0.5px]" style={{ color: c.dot }}>
                            {m.text}
                          </div>
                          <div className="font-['Outfit:Regular'] text-[9px] uppercase tracking-[0.45px]" style={{ color: c.dot }}>
                            {m.type}
                          </div>
                        </div>
                        {i < morphemes.length - 1 && (
                          <span className="font-['Outfit:Medium'] text-[#d8c3ad] text-lg">⇌</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="font-['Outfit:SemiBold'] text-[30px] tracking-[1.5px] text-[#e0e2ed] drop-shadow-[0_2px_9px_rgba(255,193,116,0.35)]">
                      {result.word}
                    </span>
                    {result.emoji && <span className="text-2xl">{result.emoji}</span>}
                    {result.type === 'PLAYFUL' && (
                      <span className="bg-[#f59e0b] text-[#613b00] font-['Outfit:SemiBold'] text-[11px] tracking-[0.55px] uppercase px-2.5 py-0.5 rounded-full">
                        PLAYFUL COMBO
                      </span>
                    )}
                    {result.type === 'PLAUSIBLE' && (
                      <span className="bg-[rgba(109,17,173,0.4)] text-[#e0b6ff] font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase px-2.5 py-0.5 rounded-full">
                        PLAUSIBLE
                      </span>
                    )}
                  </div>
                  {/* Gradient underline */}
                  <div className="h-[1.5px] w-24 mt-1"
                    style={{ background: 'linear-gradient(90deg, transparent, #ffc174, transparent)' }} />
                  {result.subtitle && (
                    <p className="font-['Plus_Jakarta_Sans:Italic'] text-[#d8c3ad] text-[12px] tracking-[0.3px] mt-2">
                      {result.subtitle}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Morpheme breakdown */}
            {result.type !== 'FAILED' && (
              <div className="bg-[rgba(11,14,22,0.8)] rounded-lg p-2 mb-3">
                <div className="flex gap-2 justify-center">
                  {morphemes.map(m => {
                    const c = MORPHEME_COLORS[m.type];
                    return (
                      <div key={m.id}
                        className="flex-1 bg-[rgba(39,42,50,0.9)] rounded p-2 text-center relative overflow-hidden shadow-sm"
                        style={{ maxWidth: 100 }}>
                        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: c.dot }} />
                        <div className="font-['Outfit:SemiBold'] text-[15px] tracking-[0.75px]" style={{ color: c.dot }}>{m.text.toLowerCase()}</div>
                        <div className="font-['Outfit:Regular'] text-[9px] tracking-[0.45px] uppercase mt-0.5" style={{ color: c.dot }}>{m.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Definition */}
            {result.definition && (
              <div className="bg-[rgba(28,31,40,0.7)] rounded-lg p-3 mb-3">
                <div className="flex gap-2 items-start mb-2">
                  <img src={`${A}/65e6e.svg`} alt="" style={{ width: 17, height: 14, marginTop: 2, flexShrink: 0 }} />
                  <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#e0e2ed] text-[14px] tracking-[0.14px] leading-[1.4]">
                    {result.definition}
                  </p>
                </div>
                {result.etymologyNote && (
                  <div className="border-t border-[#272a32] pt-2 flex gap-2 items-start">
                    <img src={`${A}/9ca65.svg`} alt="" style={{ width: 15, height: 14, marginTop: 2, flexShrink: 0 }} />
                    <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[12px] tracking-[0.24px] leading-[1.6]">
                      {result.etymologyNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI comment for playful */}
            {result.aiComment && (
              <div className="bg-[#181b24] rounded-lg p-3 mb-3">
                <div className="flex gap-2 items-start">
                  <img src={`${A}/1b23a.svg`} alt="" style={{ width: 14, height: 16, marginTop: 2, flexShrink: 0 }} />
                  <p className="font-['Plus_Jakarta_Sans:Italic'] text-[#e0e2ed] text-[14px] tracking-[0.14px] leading-[1.6]">
                    {result.aiComment}
                  </p>
                </div>
              </div>
            )}

            {result.prefixNote && (
              <div className="bg-[rgba(11,14,22,0.7)] rounded-lg p-3 mb-3">
                <div className="flex gap-2 items-start">
                  <img src={`${A}/ec75f.svg`} alt="" style={{ width: 10, height: 15, marginTop: 2, flexShrink: 0 }} />
                  <p className="font-['Plus_Jakarta_Sans:Medium'] text-[12px] tracking-[0.24px] leading-[1.6]">
                    <span className="text-[#ffc174]">Prefix note:</span>
                    <span className="text-[#d8c3ad]"> {result.prefixNote}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Related words */}
            {result.relatedWords && result.relatedWords.length > 0 && (
              <div className="bg-[rgba(109,17,173,0.15)] rounded-lg p-3 mb-3 flex gap-3 items-start shadow-sm">
                <div className="bg-[rgba(109,17,173,0.4)] rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                  <img src={`${A}/94e5e.svg`} alt="" style={{ width: 18, height: 17 }} />
                </div>
                <div>
                  <div className="font-['Outfit:SemiBold'] text-[#e0b6ff] text-[11px] tracking-[0.55px] uppercase mb-1">RELATED WORDS</div>
                  <p className="font-['Plus_Jakarta_Sans:SemiBold'] text-[#e0e2ed] text-[12px] tracking-[0.24px]">
                    {result.relatedWords.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Failed specific: hint */}
            {result.type === 'FAILED' && (
              <div className="mb-3">
                <div className="bg-[rgba(11,14,22,0.5)] rounded-lg p-3 mb-3">
                  <p className="font-['Outfit:Medium'] text-[#e0e2ed] text-[16px] leading-[1.4] mb-1">Hmm... The elements drift apart</p>
                  <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px] leading-[1.6]">
                    {result.definition}
                  </p>
                </div>
                <div className="bg-[rgba(28,31,40,0.7)] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffc174] shadow-[0_0_6px_#ffc174]" />
                    <span className="font-['Outfit:SemiBold'] text-[#ffc174] text-[11px] tracking-[0.55px] uppercase">DISCOVERY HINT</span>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px] mb-2">
                    Try pairing a Root like ACT or TRACT with these endings.
                  </p>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(245,158,11,0.15)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                      <span className="font-['Outfit:Medium'] text-[#ffc174] text-[11px]">+ ACT (to do)</span>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(245,158,11,0.15)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                      <span className="font-['Outfit:Medium'] text-[#ffc174] text-[11px]">+ TRACT (to pull)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={onContinue}
                className="w-full h-12 rounded-xl font-['Outfit:SemiBold'] text-[15px] tracking-[2.1px] uppercase text-[#472a00] flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{
                  background: result.type === 'VALID'
                    ? 'linear-gradient(90deg, #f59e0b, #ffc174, #f59e0b)'
                    : result.type === 'FAILED'
                    ? 'rgba(28,31,40,0.9)'
                    : '#ffc174',
                  color: result.type === 'FAILED' ? '#e0e2ed' : '#472a00',
                  boxShadow: result.type === 'VALID' ? '0 4px 10px rgba(245,158,11,0.25)' : undefined,
                }}
              >
                {result.type === 'VALID' ? (
                  <><img src={`${A}/429d5.svg`} alt="" style={{ width: 13, height: 13 }} /> CONTINUE</>
                ) : result.type === 'FAILED' ? (
                  <>⟳ TRY AGAIN / REARRANGE TILES</>
                ) : (
                  <>⊙ KEEP EXPLORING</>
                )}
              </button>
              {result.type !== 'FAILED' && (
                <button
                  onClick={onContinue}
                  className="w-full h-10 rounded-xl font-['Plus_Jakarta_Sans:Regular'] text-[14px] text-[#d8c3ad] flex items-center justify-center gap-1.5 bg-[#272a32] active:scale-95 transition-all"
                >
                  <img src={`${A}/92e8d.svg`} alt="" style={{ width: 11, height: 12 }} />
                  Save to Notebook
                </button>
              )}
              {result.type === 'VALID' && (
                <button className="w-full py-1.5 flex items-center justify-center gap-1 text-[#d8c3ad] font-['Outfit:Regular'] text-[12px] tracking-[0.3px]">
                  View Word Family <IconArrow />
                </button>
              )}
              {result.type === 'FAILED' && (
                <div className="flex gap-2">
                  <button
                    onClick={onContinue}
                    className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 bg-[#272a32] text-[#d8c3ad] font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase"
                  >
                    ≡ CLEAR CRUCIBLE
                  </button>
                  <button
                    onClick={() => onTabChange('DISCOVERIES')}
                    className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 bg-[#272a32] text-[#d8c3ad] font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase"
                  >
                    ⊙ EXPLORE DISCOVERIES
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Morpheme bench */}
          <div className="mt-4 bg-[rgba(24,27,36,0.7)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Outfit:Medium'] text-[#d8c3ad] text-[11px] tracking-[1.1px] uppercase">MORPHEME BENCH</span>
              <span className="font-['Outfit:Medium'] text-[#ffc174] text-[11px] tracking-[1.54px]">Drag to Combine</span>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'PREFIX', text: 're-', color: '#e0b6ff' },
                { label: 'ROOT', text: 'morph', color: '#ffc174' },
                { label: 'SUFFIX', text: '-logy', color: '#54ddfc' },
              ].map(m => (
                <div key={m.label} className="flex-1 bg-[#1c1f28] rounded-lg p-2 text-center shadow-sm">
                  <div className="font-['Outfit:Medium'] text-[11px] tracking-[1.54px] uppercase mb-0.5" style={{ color: m.color }}>{m.label}</div>
                  <div className="font-['Outfit:SemiBold'] text-[15px] tracking-[1.8px] text-[#e0e2ed]">{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Makers note */}
          <div className="mt-3 bg-[#181b24] rounded-xl p-3 flex gap-3 items-center">
            <div className="bg-[#6d11ad] rounded-full w-10 h-10 flex items-center justify-center shrink-0">
              <img src={`${A}/0fe07.svg`} alt="" style={{ width: 13, height: 17 }} />
            </div>
            <div>
              <div className="font-['Outfit:Medium'] text-[#e0e2ed] text-[15px]">Makers never make errors</div>
              <div className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[12px] tracking-[0.24px] truncate">
                Every combination expands your morphological index.
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} discCount={discCount} />
    </div>
  );
}

// ─── Discoveries View ─────────────────────────────────────────────────────────
const WORD_FAMILIES = [
  {
    root: 'SPECT', meaning: 'look · see · observe',
    latin: 'Latin: specere — to look, see, or perceive',
    words: [
      { word: 'INSPECT', desc: 'to look closely / examine', discovered: true, pos: { x: 10, y: 10 } },
      { word: 'SPECTATOR', desc: 'a person who watches', discovered: true, pos: { x: 60, y: 0 } },
      { word: 'PROSPECT', desc: 'to look forward / outlook', discovered: true, pos: { x: 5, y: 60 } },
      { word: 'RETROSPECT', desc: 'to look back', discovered: false, pos: { x: 65, y: 55 } },
      { word: 'RESPECT', desc: 'to look back upon / esteem', discovered: false, pos: { x: 35, y: 75 } },
    ],
    progress: { found: 5, total: 8 },
  },
  {
    root: 'ACT', meaning: 'do · drive · lead',
    latin: 'Latin: agere — to do, drive',
    words: [
      { word: 'REACTION', desc: 'a response', discovered: true, pos: { x: 10, y: 15 } },
      { word: 'DETRACTION', desc: 'to draw away from', discovered: true, pos: { x: 60, y: 5 } },
      { word: 'ACTIVE', desc: 'doing things', discovered: true, pos: { x: 5, y: 65 } },
      { word: 'ACTOR', desc: 'one who acts', discovered: false, pos: { x: 60, y: 60 } },
    ],
    progress: { found: 3, total: 6 },
  },
];

function DiscoveriesView({ discoveries, onForgeWith }: { discoveries: string[]; onForgeWith: (w: string) => void }) {
  const [selectedFamily, setSelectedFamily] = useState(0);
  const family = WORD_FAMILIES[selectedFamily];

  return (
    <div className="px-5 pt-4 pb-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="font-['Outfit:Bold'] text-[11px] tracking-[0.55px] uppercase text-[#d8c3ad]">WORD FAMILIES</div>
            <div className="font-['Outfit:SemiBold'] text-[22px] text-[#e0e2ed]">Discoveries</div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(39,42,50,0.8)]">
            <IconStar />
            <span className="font-['Outfit:Medium'] text-[11px] tracking-[1.1px] uppercase text-[#ffc174]">{discoveries.length} DISCOVERED</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="font-['Outfit:SemiBold'] text-[11px] tracking-[0.55px] uppercase text-[#d8c3ad]">KNOWLEDGE MAP</div>
          <div className="font-['Outfit:Medium'] text-[15px] text-[#e0e2ed]">Word Families</div>
        </div>

        {/* Family tab chips */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {WORD_FAMILIES.map((f, i) => (
            <button
              key={f.root}
              onClick={() => setSelectedFamily(i)}
              className={`px-4 py-1.5 rounded-full font-['Outfit:SemiBold'] text-[13px] tracking-[0.5px] shrink-0 transition-all ${
                selectedFamily === i
                  ? 'bg-[#ffc174] text-[#472a00]'
                  : 'bg-[rgba(39,42,50,0.8)] text-[#d8c3ad]'
              }`}
            >
              {i === 0 && selectedFamily === 0 && <><IconStar /> </>}{f.root}
            </button>
          ))}
          {['TRACT', 'FORM'].map(r => (
            <button key={r} className="px-4 py-1.5 rounded-full font-['Outfit:SemiBold'] text-[13px] tracking-[0.5px] bg-[rgba(39,42,50,0.8)] text-[#d8c3ad] shrink-0">
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Word family map (visual diagram) */}
      <div className="bg-[rgba(24,27,36,0.9)] rounded-2xl p-4 mb-4 relative overflow-hidden" style={{ minHeight: 280 }}>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-48 h-48 rounded-full border border-[#ffc174] opacity-30" />
          <div className="absolute w-64 h-64 rounded-full border border-[#ffc174] opacity-15" />
        </div>

        {/* Center root */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center">
            <div className="bg-[rgba(245,158,11,0.2)] rounded-full px-4 py-3 border border-[rgba(245,158,11,0.4)] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <div className="font-['Outfit:Bold'] text-[#ffc174] text-[18px] tracking-[1px] text-center">{family.root}</div>
              <div className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[10px] text-center">ROOT</div>
            </div>
            <div className="font-['Plus_Jakarta_Sans:Italic'] text-[#d8c3ad] text-[10px] mt-1 text-center">{family.meaning}</div>
          </div>
        </div>

        {/* Connected words */}
        {family.words.map((w) => {
          const positions = [
            'top-4 left-4', 'top-4 right-4', 'bottom-4 left-4',
            'bottom-4 right-4', 'bottom-12 left-1/2 -translate-x-1/2',
          ];
          return (
            <div key={w.word} className={`absolute ${positions[family.words.indexOf(w)]} flex flex-col items-center gap-0.5`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border ${
                w.discovered
                  ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.4)]'
                  : 'bg-[rgba(28,31,40,0.8)] border-[rgba(255,255,255,0.1)]'
              }`}>
                {w.discovered ? (
                  <span className="text-[#ffc174] text-sm">⊙</span>
                ) : (
                  <span className="text-[#d8c3ad] text-sm">?</span>
                )}
              </div>
              <span className={`font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] ${w.discovered ? 'text-[#ffc174]' : 'text-[#d8c3ad]'}`}>
                {w.discovered ? w.word : '???'}
              </span>
              {w.discovered && (
                <span className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[9px] text-center max-w-[80px]">{w.desc}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Root family info card */}
      <div className="bg-[rgba(24,27,36,0.9)] rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-[rgba(245,158,11,0.2)] rounded-full p-1.5">
              <IconStar />
            </div>
            <div>
              <div className="font-['Outfit:SemiBold'] text-[11px] tracking-[0.55px] uppercase text-[#d8c3ad]">ROOT FAMILY</div>
              <div className="font-['Outfit:Bold'] text-[18px] text-[#e0e2ed]">Root Family: {family.root}</div>
            </div>
          </div>
          <div className="bg-[rgba(39,42,50,0.8)] rounded-lg px-2 py-1 text-right shrink-0">
            <div className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[10px]">{family.latin}</div>
          </div>
        </div>
        <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[13px] leading-[1.6] mb-3">
          Core root indicating the act of looking, seeing, surveying, or observing. Unlocks words related to sight, perception, and focused analysis.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-['Outfit:SemiBold'] text-[10px] tracking-[0.5px] uppercase text-[#d8c3ad]">FAMILY PROGRESS</span>
          <span className="font-['Outfit:Bold'] text-[13px] text-[#ffc174]">
            {family.progress.found} of {family.progress.total} words discovered in this family
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden mb-4">
          <div className="h-full rounded-full" style={{
            width: `${(family.progress.found / family.progress.total) * 100}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ffc174, #e0b6ff)',
          }} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="flex-1 h-12 bg-[rgba(39,42,50,0.9)] rounded-xl flex items-center justify-center gap-2 font-['Outfit:SemiBold'] text-[12px] tracking-[0.5px] uppercase text-[#d8c3ad]">
            <img src={`${A}/ee9d2.svg`} alt="" style={{ width: 12, height: 12 }} />
            Inspect Word Family
          </button>
          <button
            onClick={() => onForgeWith(family.root)}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-['Outfit:SemiBold'] text-[12px] tracking-[0.5px] uppercase text-[#472a00]"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #ffc174)' }}
          >
            ⚗ Forge with {family.root} →
          </button>
        </div>
      </div>

      {/* Etymology insight */}
      <div className="flex items-center gap-2 px-1 py-2">
        <span className="w-2 h-2 rounded-full bg-[#ffc174] shadow-[0_0_6px_#ffc174]" />
        <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[12px] leading-[1.5] flex-1">
          Combines with prefixes like 'in-', 're-', and 'circum-' to form nuanced viewpoints
        </p>
        <span className="text-[#d8c3ad]">›</span>
      </div>
    </div>
  );
}

// ─── Journal View ─────────────────────────────────────────────────────────────
function JournalView() {
  return (
    <div className="px-5 pt-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-[#1c1f28] flex items-center justify-center mb-4">
        <IconJournal />
      </div>
      <h2 className="font-['Outfit:Bold'] text-[22px] text-[#e0e2ed] mb-2 tracking-[0.5px]">Your Notebook</h2>
      <p className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[14px] text-center max-w-xs leading-[1.6]">
        Words you save to your notebook will appear here for review and reflection.
      </p>
      <div className="mt-6 flex flex-col gap-3 w-full">
        {['REACTION', 'DETRACTION'].map(w => (
          <div key={w} className="bg-[#1c1f28] rounded-xl p-4 flex items-center justify-between border border-[rgba(255,255,255,0.06)]">
            <div>
              <div className="font-['Outfit:SemiBold'] text-[#e0e2ed] text-[16px] tracking-[0.5px]">{w}</div>
              <div className="font-['Plus_Jakarta_Sans:Regular'] text-[#d8c3ad] text-[12px] mt-0.5">Saved to notebook</div>
            </div>
            <span className="text-[#ffc174] text-sm">✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}
