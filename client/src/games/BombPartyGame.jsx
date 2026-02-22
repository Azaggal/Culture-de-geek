
import React, { useState, useEffect } from 'react';
import { ScoreBadge } from '../components/ScoreBadge';

export const BombPartyGame = ({ socket, review, pseudoReview, estBon, theme }) => {
  const [bombState, setBombState] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket || review) return;

    socket.on('bomb_update', (state) => {
      setBombState(state);
      setError("");
      if (state.currentPlayerId !== socket.id) {
        setInputValue("");
      }
    });

    socket.on('bomb_error', (msg) => {
      setError(msg);
      socket.emit('submit_bomb_letters', "");
      setTimeout(() => setError(""), 1500);
    });

    return () => {
      socket.off('bomb_update');
      socket.off('bomb_error');
    };
  }, [socket, review]);

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);
    socket.emit('submit_bomb_letters', val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      socket.emit('submit_bomb_word', inputValue);
      setInputValue(""); 
    }
  };

  if (review) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
           <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
           <div className="relative bg-slate-800 border-4 border-slate-700 p-8 rounded-full shadow-2xl">
              <span className="text-6xl">💣</span>
           </div>
        </div>
        <h2 className="text-4xl font-black text-slate-100 uppercase tracking-widest">{pseudoReview}</h2>
        <div className="flex flex-col items-center gap-2">
           <p className="text-slate-400 font-bold uppercase text-sm">Vies restantes</p>
           <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`text-4xl ${i < estBon ? 'grayscale-0 animate-bounce' : 'grayscale opacity-30'}`} style={{animationDelay: `${i*0.1}s`}}>❤️</span>
              ))}
           </div>
        </div>
        <div className="mt-8">
          {estBon > 0 ? (
            <ScoreBadge points={estBon} theme={theme} className="scale-150 mb-8" />
          ) : (
            <p className="text-rose-500 text-5xl font-black uppercase">ÉLIMINÉ</p>
          )}
        </div>
      </div>
    );
  }

  if (!bombState) return <div className="text-white animate-pulse font-bold text-2xl">Initialisation de la bombe...</div>;

  const isMyTurn = bombState.currentPlayerId === socket.id;

  return (
    <div className="flex flex-col items-center w-full gap-8">
      <div className="relative flex items-center justify-center"> 
        <div className="relative bg-slate-900 w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 border-slate-800 shadow-2xl z-10">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Contient</p>
          <p className="text-6xl font-black text-white">{bombState.syllabe}</p>
          <div className={`mt-2 text-2xl font-black ${bombState.turnTimeLeft < 4 ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`}>
            {bombState.turnTimeLeft}s
          </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {isMyTurn ? (
          <div className="w-full flex flex-col items-center gap-2">
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Tape ton mot..."
              className={`${theme.input.game} border-rose-500 text-rose-500 placeholder-rose-900/30 text-3xl h-20 shadow-[0_8px_0_rgb(159,18,57)] transition-all`}
            />
            {error && <p className="text-rose-500 font-bold animate-bounce uppercase text-sm tracking-tighter">{error}</p>}
          </div>
        ) : (
          <div className=" p-6 rounded-2xl border-2 border-slate-700 flex flex-col items-center gap-1 w-full">
            <p className="text-slate-500 text-xs font-bold uppercase">Tour de</p>
            <p className="text-3xl font-black text-blue-400 uppercase">{bombState.currentPlayerPseudo}</p>
            <div className="mt-2 h-12 flex items-center justify-center bg-slate-900/50 w-full rounded-lg border border-slate-700">
               <p className="text-white font-mono text-2xl tracking-[0.2em] uppercase">
                  {bombState.joueursStatus.find(j => j.isCurrent)?.rep || "..."}
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full">
        {bombState.joueursStatus.map((j, idx) => (
          <div key={idx} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${j.isCurrent ? 'bg-rose-500/10 border-rose-500 scale-110 shadow-lg' : 'bg-slate-800/40 border-slate-700 opacity-60'}`}>
            <p className="font-bold text-sm text-white mb-2">{j.pseudo}</p>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`text-sm ${i < j.vies ? 'grayscale-0' : 'grayscale opacity-20'}`}>❤️</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
