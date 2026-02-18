import { useState, useEffect, useRef, memo } from 'react'
import io from 'socket.io-client';

// ==================================================================================
// 1. CONFIGURATION ATOMIQUE (Couleurs & Ombres de base)
// ==================================================================================

const COLORS = {
  purple: {
    main: "rgb(147,51,234)", // Pour usage JS si besoin (canvas etc)
    text: "text-purple-600",
    textDark: "text-purple-900",
    bg: "bg-purple-400",
    border: "border-purple-600",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-100",
    disabled: "bg-slate-300 cursor-not-allowed"
  },
  status: {
    success: "bg-emerald-500",
    successLight: "bg-emerald-300",
    error: "bg-rose-400",
    neutral: "bg-slate-200"
  },

  hover: "hover:cursor-pointer hover:brightness-100 brightness-95"
};

const SHADOWS = {
  // L'ombre violette standard utilisée partout
  color: "rgb(147,51,234)", 
  
  // Les définitions CSS complètes
  small: {
    css: "shadow-[0_6px_0_rgb(147,51,234)]",
    active: "active:translate-y-[6px] active:shadow-none"
  },
  large: {
    css: "shadow-[0_15px_0_rgb(147,51,234)]",
    active: "active:translate-y-[15px] active:shadow-none"
  },
  input: {
    css: "shadow-[0_4px_0_rgb(147,51,234)]"
  }
};

const PALETTE_LUMIERE = {
  contour: "rounded-xl border border-blue-500/30 ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
}

// ==================================================================================
// 2. STRUCTURES DE BASE (Molécules - Formes réutilisables)
// ==================================================================================

const BASES_COMIC = {
  // Le squelette de tous les boutons
  btn: `transition-all ease-in-out font-bold z-45 rounded-xl border-2 flex items-center justify-center`,
  
  // Le squelette de tous les inputs
  input: "p-2 border-2 rounded-xl w-full text-xl font-bold outline-none placeholder-slate-300 transition-all",
  
  // Le squelette des cartes/conteneurs
  card: "transition-all duration-500 ease-in-out rounded-3xl"
};

const BASES_LUMIERE = {
  // Le squelette de tous les boutons
  btn: `transition-all ease-in-out font-bold rounded-xl border-2 ${COLORS.hover} flex items-center justify-center`,
  
  
  // Le squelette de tous les inputs
  input: "p-2 border-2 rounded-xl w-full text-lg font-bold outline-none placeholder-slate-300 transition-all",
  
  // Le squelette des cartes/conteneurs
  card: "transition-all duration-500 ease-in-out rounded-3xl"
};

// ==================================================================================
// 3. ASSEMBLAGE FINAL DU THÈME (Organismes - À utiliser dans le JSX)
// ==================================================================================

const THEMES_CONFIG = {
  comic: {
    name: "comic",

    bg: {
      color: "none",
      image: "url(/images/bg.jpg)",
    },
    
    container: {
      centered: "flex items-center justify-center min-h-screen bg-cover bg-center",
      // La carte principale (Lobby, Jeu, etc.)
      card: `${COLORS.purple.bg} ${BASES_COMIC.card} p-10 flex flex-row gap-4 justify-center `,
      // Le header blanc "verre" pour les questions
      glassHeader: "flex-1 p-8 text-3xl font-black text-purple-700 bg-white/90 backdrop-blur-md rounded-3xl border-b-[10px] border-purple-900/20 text-center uppercase",
    },

    input: {
      // Input standard (Lobby)
      lobby: `${BASES_COMIC.input} ${COLORS.slate.bg} ${COLORS.purple.border} ${COLORS.purple.text} ${SHADOWS.input.css} `,
      // Input de jeu (plus gros)
      game: `${BASES_COMIC.input} ${COLORS.slate.bg} ${COLORS.purple.border} ${COLORS.purple.textDark} ${SHADOWS.input.css} text-2xl h-12 text-center`,

      disabled: `${BASES_COMIC.input} ${COLORS.purple.border} ${COLORS.purple.text} ${SHADOWS.input.css} ${COLORS.slate.disabled}`,
    },

    button: {
      // Bouton standard (Menu, Prêt, Lobby)
      disabled:`
        ${BASES_COMIC.btn} brightness-95
        ${COLORS.slate.bg} ${COLORS.purple.text} ${COLORS.purple.border} 
        translate-y-[6px]  ${COLORS.slate.disabled}
        p-4 text-xl
      `,

      primary: `
        ${BASES_COMIC.btn} ${COLORS.hover}
        ${COLORS.slate.bg} ${COLORS.purple.text} ${COLORS.purple.border} 
        ${SHADOWS.small.css} ${SHADOWS.small.active}
        p-4 text-xl
      `,
      
      // Gros bouton de réponse (Jeu)
      gameAnswer: `
        ${BASES_COMIC.btn} ${COLORS.hover}
        ${COLORS.slate.bg} ${COLORS.purple.text} ${COLORS.purple.border}
        ${SHADOWS.large.css} ${SHADOWS.large.active}
        p-2 w-120 h-50 mr-15 mt-5 mb-5 text-xl
      `,

      // Petit bouton carré (Choix nombres)
      choice: `
        ${BASES_COMIC.btn} ${COLORS.hover}}
        bg-slate-200 ${COLORS.purple.text} ${COLORS.purple.border}
        ${SHADOWS.small.css} ${SHADOWS.small.active}
        p-2 w-15 h-max mr-2 text-xl
      `,

      choiceDisabled: `
        ${BASES_COMIC.btn} 
         ${COLORS.slate.disabled} ${COLORS.purple.text} ${COLORS.purple.border}
        ${SHADOWS.small.css} 
        p-2 w-15 h-max mr-2 text-xl
      `,

      // États spécifiques
      stateQcm: {
        wrong: `font-bold rounded-xl border-2
          ${COLORS.status.error} ${COLORS.purple.text} ${COLORS.purple.border}
          ${SHADOWS.large.css}
          p-2 w-120 h-50 mr-15 mt-5 mb-5 text-xl}`,

        correct: `font-bold rounded-xl border-2
          ${COLORS.status.success} ${COLORS.purple.text} ${COLORS.purple.border}
          ${SHADOWS.large.css}
          p-2 w-120 h-50 mr-15 mt-5 mb-5 text-xl}`,

        neutral: `font-bold rounded-xl border-2
          ${COLORS.status.neutral} ${COLORS.purple.text} ${COLORS.purple.border}
          ${SHADOWS.large.css}
          p-2 w-120 h-50 mr-15 mt-5 mb-5 text-xl}`,
          pressed: "translate-y-[6px] shadow-none brightness-100",
          pressedGame: "translate-y-[15px] shadow-none brightness-100",
          disabled: "opacity-50 cursor-not-allowed active:translate-y-0 active:shadow-[0_6px_0_rgb(147,51,234)]"

        },

        stateBtnBon: {
        wrong: `
          ${BASES_COMIC.btn} ${COLORS.status.error} 
          ${COLORS.purple.text} ${COLORS.purple.border} 
        ${SHADOWS.small.css} ${SHADOWS.small.active} ${COLORS.hover}
        p-4 text-xl`,
          disabled: "opacity-50 cursor-not-allowed active:translate-y-0 active:shadow-[0_6px_0_rgb(147,51,234)]",

        correct: `
          ${BASES_COMIC.btn} ${COLORS.status.success}
          ${COLORS.purple.text} ${COLORS.purple.border} 
        ${SHADOWS.small.css} ${SHADOWS.small.active}
        p-4 text-xl`,

        },
        
      },

    text: {
      label: "text-purple-900 font-black text-sm uppercase ml-1",
      title: "text-slate-100 font-bold text-sm uppercase ml-1",
      code: {
        normal: "text-purple-900 font-black text-2xl ml-1 font-semibold outline-none border-b-2 border-cyan-500 focus:border-purple-400 transition-colors uppercase",
        wrong: "text-rose-500 font-black text-2xl ml-1 font-semibold outline-none border-b-2 border-rose-500 focus:border-rose-400 transition-colors uppercase",
      }
    }
  },


  lumiere: {
    name: "lumière",
    
    bg: {
      color: "rgb(0,0,0)",
      image: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(images/bg.jpg)`,
    },

    container: {
      centered: "flex items-center justify-center min-h-screen bg-cover bg-center",
      // La carte principale (Lobby, Jeu, etc.)
      card: `bg-slate-900 p-8 ${PALETTE_LUMIERE.contour} ${BASES_LUMIERE.card} p-10 flex flex-row gap-4`,
      // Le header blanc "verre" pour les questions
      glassHeader: "flex-1 p-8 text-3xl font-black text-purple-700 bg-white/90 backdrop-blur-md rounded-3xl border-b-[10px] border-purple-900/20 text-center uppercase",
    },

    input: {
      // Input standard (Lobby)
      lobby: `${BASES_LUMIERE.input} ${COLORS.slate.bg} ${COLORS.purple.border} ${COLORS.purple.text} ${SHADOWS.input.css}`,
      // Input de jeu (plus gros)
      game: `${BASES_LUMIERE.input} ${COLORS.slate.bg} ${COLORS.purple.border} ${COLORS.purple.textDark} ${SHADOWS.input.css} text-2xl h-12 text-center`,
    },

    button: {
      // Bouton standard (Menu, Prêt, Lobby)
      primary: `
        ${BASES_LUMIERE.btn} 
        ${COLORS.slate.bg} ${COLORS.purple.text} ${PALETTE_LUMIERE.contour} 
        ${SHADOWS.small.css} ${SHADOWS.small.active}
        p-4 text-xl
      `,
      
      // Gros bouton de réponse (Jeu)
      gameAnswer: `
        ${BASES_LUMIERE.btn}
        ${COLORS.slate.bg} ${COLORS.purple.text} ${COLORS.purple.border}
        ${SHADOWS.large.css} ${SHADOWS.large.active}
        p-2 w-120 h-50 mr-15 mt-5 mb-5 text-xl
      `,

      // Petit bouton carré (Choix nombres)
      choice: `
        ${BASES_LUMIERE.btn}
        bg-slate-200 ${COLORS.purple.text} ${COLORS.purple.border}
        ${SHADOWS.small.css} ${SHADOWS.small.active}
        p-2 w-15 h-max mr-2 text-xl
      `,

      // États spécifiques
      state: {
        pressed: "translate-y-[6px] shadow-none brightness-100",
        pressedGame: "translate-y-[15px] shadow-none brightness-100",
        disabled: "opacity-50 cursor-not-allowed active:translate-y-0 active:shadow-[0_6px_0_rgb(147,51,234)]"
      }
    },

    text: {
      label: "text-purple-900 font-black text-sm uppercase ml-1",
      title: "text-slate-100 font-bold text-sm uppercase ml-1",
    }
  }
};


// ==================================================================================
// LOGIQUE DE L'APPLICATION
// ==================================================================================

let permanentId = localStorage.getItem('idQuiz');
if (!permanentId) {
    permanentId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('idQuiz', permanentId);
}

let socket;

// --- COMPOSANTS UTILITAIRES ---

const ButtonRepReview = ({reponse, isCorrect, clicked, theme}) => {
  
  const styleActif = clicked ? theme.button.stateQcm.pressedGame : "";
  
  // Note: Pour le review, on garde la logique de couleur spécifique car elle dépend de l'état (vrai/faux)
  // Mais on utilise le style de base du thème pour la forme
  return (
      <button disabled={true}
        className={`
           ${clicked && isCorrect ? `${theme.button.stateQcm.correct} ${styleActif}` : ""}
           ${clicked && !isCorrect ? `${theme.button.stateQcm.wrong} ${styleActif}` : ""}
           ${!clicked && isCorrect ? theme.button.stateQcm.correct  : ""}
           ${!clicked && !isCorrect ? theme.button.stateQcm.neutral  : ""}
        `}
        >{reponse}</button>
  );
}




const QuestionWikipedia = memo(({ depart, arrivee, socket, review, valueText, estBon, isFullscreen, toggleFullscreen, pseudoReview }) => {
  const [currentPage, setCurrentPage] = useState(depart);
  const [hasWon, setHasWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  
  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null); // La boîte secrète intouchable par React


  

  useEffect(() => {
    if (!socket || review) return;
    const handleWin = () => setHasWon(true);
    socket.on('wiki_win', handleWin);
    return () => socket.off('wiki_win', handleWin);
  }, [socket, review]);

  const accueil = () => {
    fetchWikiPage(depart);
  }

  const fetchWikiPage = async (title) => {
    setLoading(true);
    
    if (contentRef.current) {
    contentRef.current.innerHTML = "";
  }

    try {
      const res = await fetch(`https://fr.wikipedia.org/w/api.php?origin=*&action=parse&page=${encodeURIComponent(title)}&format=json&prop=text&mobileformat=1&disableeditsection=1`);
      const data = await res.json();
      
      if (data && data.parse && data.parse.text) {
        setHtmlContent(data.parse.text['*'].replace(/src="\/\//g, 'src="https://'));
        setCurrentPage(title);
      }
    } catch (e) {
      console.error("Erreur API Wiki");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (!review && depart) {
      fetchWikiPage(depart);
    }
  }, [depart, review]);

  // --- LE CŒUR DE LA MAGIE (JAVASCRIPT PUR) ---
  useEffect(() => {
    if (!contentRef.current || !htmlContent || hasWon || review) return;

    // 1. On injecte le HTML SANS passer par React
    contentRef.current.innerHTML = htmlContent;

    // --- NOUVEAUTÉ : ON PRÉPARE LES INFO-BULLES ---
    const allLinks = contentRef.current.querySelectorAll('a');
    allLinks.forEach(aTag => {
      const href = aTag.getAttribute('href');
      
      if (!href || href.startsWith('#') || !(aTag.className === '')) {
        aTag.classList.add('lien-interdit');
        return;
      }

      console.log(aTag);

      let targetTitle = null;
      // On décrypte le lien exactement comme on le fait pour le clic
      if (href.includes('/wiki/')) {
        targetTitle = href.substring(href.indexOf('/wiki/') + 6).split('#')[0];
      } else if (href.startsWith('./')) {
        targetTitle = href.substring(2).split('#')[0];
      } else if (href.includes('title=')) {
        const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
        targetTitle = urlParams.get('title');
      }

      if (targetTitle) {
        // On nettoie le titre pour l'affichage (enlève les _ et %20)
        const cleanTitle = decodeURIComponent(targetTitle).replace(/_/g, ' ');
        // On l'injecte dans un attribut personnalisé
        aTag.setAttribute('data-destination', cleanTitle);
      }
    });
    // ----------------------------------------------

    // 2. On remonte l'ascenseur tout en haut de l'article
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0);

    // 3. On crée un écouteur de clic infaillible sur cette boîte
    const handleClick = (e) => {
      const aTag = e.target.closest('a');
      if (!aTag) return; 

      console.log("click : ", aTag);

      e.preventDefault(); // Stoppe le navigateur immédiatement

      const href = aTag.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let nextTitle = null;

      if (href.includes('/wiki/')) {
        nextTitle = href.substring(href.indexOf('/wiki/') + 6).split('#')[0];
      } else if (href.startsWith('./')) {
        nextTitle = href.substring(2).split('#')[0];
      } else if (href.includes('title=')) {
        const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
        nextTitle = urlParams.get('title');
      }

      if (nextTitle) {
        nextTitle = decodeURIComponent(nextTitle);
        
        const badPrefixes = ['Spécial:', 'Fichier:', 'Catégorie:', 'Portail:', 'Aide:', 'Wikipédia:', 'Discussion:'];
        if (badPrefixes.some(prefix => nextTitle.startsWith(prefix))) return;

        socket.emit('wiki_click', nextTitle);
        fetchWikiPage(nextTitle);
      }
    };

    // 4. On pose l'écouteur
    contentRef.current.addEventListener('click', handleClick);

    // 5. On nettoie tout quand la page change !
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleClick);
        contentRef.current.innerHTML = ""; // On vide la boîte
      }
    };
  }, [htmlContent, hasWon, review]);

  // --- MODE REVIEW ---
  if (review) {
    const parcours = (typeof valueText === 'string' ? valueText : "").split(' ➔ ');
    return (
      <div className="flex flex-col items-center mt-12 animate-fade-in w-full max-w-4xl">
        <h2 className="text-3xl text-slate-200 font-bold mb-6">Parcours de <span className="text-purple-400 uppercase">{pseudoReview}</span></h2>
        
        <div className="bg-slate-800 p-6 rounded-xl border-4 border-slate-700 w-full text-center leading-loose">
          {parcours.map((page, index, array) => (
            <span key={index} className="inline-block">
              <span className={`font-bold px-2 py-1 rounded shadow-sm ${index === 0 ? 'bg-blue-600 text-white' : index === array.length - 1 && estBon > 0 ? 'bg-emerald-600 text-white' : 'text-slate-800 bg-slate-200'}`}>
                {page}
              </span>
              {index < array.length - 1 && <span className="mx-2 text-slate-500 font-black">➔</span>}
            </span>
          ))}
        </div>
        <p className={`text-4xl mt-8 font-black ${estBon > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
          {estBon > 0 ? `+${estBon} points ! (Objectif atteint)` : 'Perdu...'}
        </p>
      </div>
    );
  }

  // --- MODE JEU ---
  return (
    // ON SUPPRIME le "fixed inset-0". On lui dit juste de s'étirer (max-w-none) avec une transition douce.
    <div className={`flex flex-col items-center w-full transition-all duration-500 ${isFullscreen ? "h-full flex-1 max-w-none" : "h-full max-w-5xl"}`}>
      
      <div className="flex flex-row items-center justify-between w-full bg-slate-800 p-3 md:p-4 rounded-t-xl border-2 border-slate-600 border-b-0 shadow-lg gap-2 shrink-0">
        <div className="text-left flex-1 truncate">
          <p className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Actuel</p>
          <p className="text-blue-400 text-sm md:text-xl font-black truncate">{currentPage}</p>
        </div>
        {/* NOUVEAU : On utilise toggleFullscreen du parent */}
        <button 
          onClick={toggleFullscreen}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg font-bold text-xl md:text-2xl transition-colors mx-2 shadow-inner"
        >
          {isFullscreen ? "↙️" : "⛶"}
        </button>
        <button 
          onClick={accueil}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg font-bold text-xl md:text-2xl transition-colors mx-2 shadow-inner"
        >
          Accueil
        </button>
        <div className="text-right flex-1 truncate">
          <p className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Cible</p>
          <p className="text-emerald-400 text-sm md:text-xl font-black truncate">{arrivee}</p>
        </div>
      </div>

      {hasWon ? (
        <div 
          ref={scrollContainerRef}
          // NOUVEAU : flex-1 min-h-0 garantit que Wikipedia prend TOUT l'espace dispo et scrolle proprement
          className={`w-full bg-white text-black rounded-b-xl p-4 md:p-8 overflow-y-auto shadow-inner wiki-container ${isFullscreen ? "flex-1 min-h-0" : "h-[65vh]"}`}
        >
          <div className="text-6xl md:text-8xl animate-bounce">🏆</div>
          <h2 className="text-3xl md:text-5xl text-emerald-400 font-black mt-4 text-center">CIBLE ATTEINTE !</h2>
          <p className="text-slate-300 mt-4 text-xl">Attente des autres joueurs...</p>
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className={`w-full bg-white text-black rounded-b-xl p-4 md:p-8 overflow-y-auto shadow-inner wiki-container ${isFullscreen ? "h-full" : "h-[65vh]"}`}
        >
          <style>{`
            .wiki-container { font-family: -apple-system, sans-serif; color: #202122; line-height: 1.6; font-size: 16px; }
            .wiki-container h1, .wiki-container h2, .wiki-container h3 { font-family: 'Linux Libertine', Georgia, serif; border-bottom: 1px solid #eaecf0; margin-top: 1.5em; margin-bottom: 0.5em; padding-bottom: 0.25em; font-weight: normal; }
            .wiki-container h1 { font-size: 2em; } .wiki-container h2 { font-size: 1.5em; }
            .wiki-container a:not(.lien-interdit) { color: #3b82f6; text-decoration: none; font-weight: 500; cursor: pointer; position: relative; }
            .wiki-container a:not(.lien-interdit):hover { text-decoration: underline; color: #1d4ed8; }

            /* NOUVEAU : Style des liens interdits (gris clair, sans clic) */
            .wiki-container a.lien-interdit { 
              color: #94a3b8; /* Gris ardoise clair */
              cursor: not-allowed; 
              text-decoration: none; 
              pointer-events: none; /* Magique : désactive complètement le clic et le survol ! */
            }

            .wiki-container img { max-width: 100%; height: auto; border-radius: 6px; }
            .wiki-container .infobox { width: 100%; border: 1px solid #a2a9b1; background-color: #f8f9fa; margin: 1em 0; padding: 15px; border-radius: 12px; }
            .wiki-container .infobox th { text-align: left; padding-right: 10px; }
            .wiki-container ul { list-style-type: disc; margin-left: 1.5em; margin-bottom: 1em; }
            .wiki-container .navbox, .wiki-container .metadata, .wiki-container .ambox, .wiki-container .mw-editsection, .wiki-container .reference { display: none !important; }
            

            /* NOUVEAU : Animation de transition douce à l'apparition de la page */
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(15px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .page-transition {
              animation: fadeSlideIn 0.4s ease-out forwards;
            }

            /* NOUVEAU : Le style de l'info-bulle au survol d'un lien */
            .wiki-container a[data-destination]:hover::after {
              content: "➔ " attr(data-destination);
              position: absolute;
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              background-color: #1e293b; /* Bleu nuit très classe */
              color: #34d399; /* Vert émeraude */
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: bold;
              white-space: nowrap;
              z-index: 1000;
              pointer-events: none;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              animation: popTooltip 0.15s ease-out forwards;
            }

            @keyframes popTooltip {
              from { opacity: 0; transform: translate(-50%, 5px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>

          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold text-2xl animate-pulse min-h-[40vh]">
              <span className="text-5xl mb-4">🌍</span> Voyage en cours...
            </div>
          ) : (
            // MAGIE : Fini le dangerouslySetInnerHTML !
            // NOUVEAU : On ajoute la classe "page-transition" pour déclencher l'animation au montage
            <div className="page-transition" ref={contentRef} />
          )}
        </div>
      )}
    </div>
  );
});


const QuestionPetitBac = ({ categories, lettre, theme, remplirText, review, valueText, isChef, etatLignes, changeEtat }) => {
  let reponses = ["", "", "", "", ""];
  try {
    if (valueText) reponses = JSON.parse(valueText);
  } catch(e) {}

  // AUTO-VALIDATION : S'exécute dès le début de la Review
  useEffect(() => {
    // Si on est le chef, qu'on est en review, et que l'état n'est pas encore un tableau
    if (review && isChef && !Array.isArray(etatLignes)) {
       const autoValidation = reponses.map(mot => {
          const motNettoye = mot.trim().toLowerCase();
          // C'est bon SI ça commence par la bonne lettre ET que ce n'est pas juste une seule lettre tapée au pif
          return motNettoye.startsWith(lettre.toLowerCase()) && motNettoye.length > 1;
       });
       // On envoie le tableau au serveur pour synchroniser tout le monde !
       changeEtat(autoValidation);
    }
  }, [review, isChef, valueText, lettre, etatLignes, changeEtat]);

  const handleChange = (index, val) => {
    if (review) return;
    const newRep = [...reponses];
    newRep[index] = val;
    remplirText(JSON.stringify(newRep));
  };

  // Fonction pour le chef : forcer un mot à Bon ou Faux
  const toggleLigne = (index, statut) => {
    if (!Array.isArray(etatLignes)) return;
    const newEtat = [...etatLignes];
    newEtat[index] = statut;
    changeEtat(newEtat); // Synchronise en temps réel
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      
      {/* LA LETTRE GÉANTE */}
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 rounded-2xl transform rotate-3 shadow-lg"></div>
        <div className="relative text-7xl font-black text-purple-600 bg-white w-28 h-28 flex items-center justify-center rounded-2xl shadow-xl border-4 border-slate-200 transform -rotate-3 z-10">
          {lettre}
        </div>
      </div>

      {/* LES 5 LIGNES DE CATÉGORIES */}
      <div className="w-full flex flex-col gap-3 mt-4">
        {categories.map((cat, i) => {
          // On regarde si cette ligne spécifique est validée ou non
          const estLigneBonne = Array.isArray(etatLignes) ? etatLignes[i] : false;

          return (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-4 rounded-xl border-2 shadow-sm w-full transition-colors duration-300
              ${review ? (estLigneBonne ? 'bg-emerald-900/40 border-emerald-500' : 'bg-rose-900/40 border-rose-500') : 'bg-slate-800 border-slate-700'}
            `}>
              
              <span className={`font-bold w-full md:w-1/3 text-center md:text-right uppercase tracking-wider text-sm
                ${review ? (estLigneBonne ? 'text-emerald-400' : 'text-rose-400') : 'text-emerald-400'}
              `}>
                {cat}
              </span>

              <input
                disabled={review}
                type="text"
                value={reponses[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={`Commence par ${lettre}...`}
                className={`w-full md:w-2/3 ${theme.input.game} 
                  ${review ? (estLigneBonne ? 'text-emerald-300 bg-emerald-950/50 text-center font-bold border-none' : 'text-rose-300 bg-rose-950/50 text-center font-bold border-none line-through opacity-70') : ''}
                `}
              />

              {/* BOUTONS DE CONTRÔLE (Uniquement pour le Chef en Review) */}
              {review && isChef && Array.isArray(etatLignes) && (
                <div className="flex gap-2 w-full md:w-auto justify-center mt-2 md:mt-0">
                  <BoutonValide changeEtat={(etat) => toggleLigne(i, etat)} theme={theme} etat={estLigneBonne} isChef={isChef}/>  
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuestionChronologie = ({ items, theme, remplirText, review, valueText, vraieReponse }) => {
  const [liste, setListe] = useState([]);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const itemsRef = useRef([]); // Pour calculer les distances en pixels
  const [hoverIndex, setHoverIndex] = useState(null); // Pour l'effet visuel du survol

  // L'état magique qui gère l'animation en 3 étapes
  const [animState, setAnimState] = useState({
    active: false,
    source: null,
    target: null,
    step: 0,
    sourceDistX: 0,
    shifts: []
  });

  useEffect(() => {
    if (!review && items) {
      setListe(items);
      remplirText(items.map(i => i.nom).join('|'));
    } else if (review && valueText) {
      const nomsJoueur = valueText.split('|');
      const listeJoueur = nomsJoueur.map(nom => items.find(i => i.nom === nom)).filter(Boolean);
      setListe(listeJoueur.length === 4 ? listeJoueur : items);
    }
  }, [items, review]);

  // --- LE MOTEUR D'ANIMATION (PC & Mobile) ---
  const triggerAnimation = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex || sourceIndex === null || targetIndex === null || animState.active) return;

    // 1. Calcul des distances exactes en pixels
    const sourceEl = itemsRef.current[sourceIndex];
    const targetEl = itemsRef.current[targetIndex];
    const sourceDistX = targetEl.offsetLeft - sourceEl.offsetLeft;

    let shifts = new Array(liste.length).fill(0);
    if (sourceIndex < targetIndex) {
      for (let i = sourceIndex + 1; i <= targetIndex; i++) {
        shifts[i] = itemsRef.current[i - 1].offsetLeft - itemsRef.current[i].offsetLeft;
      }
    } else {
      for (let i = targetIndex; i < sourceIndex; i++) {
        shifts[i] = itemsRef.current[i + 1].offsetLeft - itemsRef.current[i].offsetLeft;
      }
    }

    // ÉTAPE 1 : Le carré monte (Immédiat)
    setAnimState({ active: true, source: sourceIndex, target: targetIndex, step: 1, sourceDistX, shifts });
    setHoverIndex(null);

    // ÉTAPE 2 : Décalage en l'air (Après 200ms)
    setTimeout(() => {
      setAnimState(prev => ({ ...prev, step: 2 }));
    }, 200);

    // ÉTAPE 3 : Descente (Après 450ms)
    setTimeout(() => {
      setAnimState(prev => ({ ...prev, step: 3 }));
    }, 450);

    // FIN : Mise à jour de la vraie liste et nettoyage (Après 700ms)
    setTimeout(() => {
      let _liste = [...liste];
      const draggedItem = _liste.splice(sourceIndex, 1)[0];
      _liste.splice(targetIndex, 0, draggedItem);
      
      setListe(_liste);
      remplirText(_liste.map(i => i.nom).join('|'));
      setAnimState({ active: false, source: null, target: null, step: 0, sourceDistX: 0, shifts: [] });
      dragItem.current = null;
      dragOverItem.current = null;
    }, 700);
  };

  // --- Événements Drag & Drop ---
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    // On masque la "preview" fantôme par défaut du navigateur pour laisser briller notre animation
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    setHoverIndex(index);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    triggerAnimation(dragItem.current, dragOverItem.current);
  };

  // --- Logique des Transforms CSS ---
  const getTransform = (index) => {
    if (!animState.active) return "translate(0px, 0px)";

    if (index === animState.source) {
      if (animState.step === 1) return `translate(0px, -150px) scale(1.05)`; // Monte et grossit un peu
      if (animState.step === 2) return `translate(${animState.sourceDistX}px, -150px) scale(1.05)`; // Vole
      if (animState.step === 3) return `translate(${animState.sourceDistX}px, 0px) scale(1)`; // Atterrit
    } else if (animState.step >= 2) {
      return `translate(${animState.shifts[index]}px, 0px)`; // Les autres s'écartent
    }
    return "translate(0px, 0px)";
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl pt-5"> 
      {/* pt-32 donne l'espace vital au-dessus pour que la carte puisse voler */}
      
      <div className="flex flex-row justify-center items-stretch gap-2 md:gap-4 w-full flex-wrap md:flex-nowrap relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-2 bg-slate-700 -z-10 rounded-full"></div>

        {liste.map((item, index) => (
          <div
            key={item.nom + index}
            ref={el => (itemsRef.current[index] = el)}
            draggable={!review && !animState.active}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={{
              transform: getTransform(index),
              transition: animState.active ? "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
              zIndex: animState.source === index ? 50 : 1
            }}
            className={`flex flex-col items-center bg-slate-800 rounded-xl p-2 md:p-3 border-4 flex-1 min-w-[120px] shadow-lg
              ${review ? (valueText.split('|')[index] === vraieReponse[index].nom ? 'border-emerald-500' : 'border-rose-500') : 'border-purple-500 cursor-grab active:cursor-grabbing'}
              ${hoverIndex === index && !animState.active && dragItem.current !== index ? 'brightness-150 border-dashed scale-95' : ''}
              ${animState.source === index ? 'shadow-[0_20px_25px_-5px_rgb(0,0,0,0.5)]' : ''}
            `}
          >
            <img src={item.image} alt={item.nom} className="w-full h-24 md:h-40 object-cover rounded-lg pointer-events-none" />
            <p className="text-white font-bold text-center mt-2 text-xs md:text-sm h-10 flex items-center justify-center pointer-events-none">
              {item.nom}
            </p>

            {/* Boutons Mobiles (Ils utilisent la MEME animation !) */}
            {!review && (
              <div className="flex w-full justify-between mt-2 md:hidden">
                <button 
                  onClick={() => triggerAnimation(index, index - 1)} 
                  disabled={index === 0 || animState.active}
                  className="bg-purple-600 text-white p-1 rounded hover:bg-purple-500 px-3 font-bold disabled:opacity-50" 
                >◀</button>
                <button 
                  onClick={() => triggerAnimation(index, index + 1)} 
                  disabled={index === liste.length - 1 || animState.active}
                  className="bg-purple-600 text-white p-1 rounded hover:bg-purple-500 px-3 font-bold disabled:opacity-50" 
                >▶</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CORRECTION */}
      {review && (
        <div className='w-full' >
        <label className={`${theme.text.label} ml-15`}> Réponse : </label>
        <div className="flex flex-row justify-center items-stretch gap-2 md:gap-4 w-full flex-wrap md:flex-nowrap relative">
        {/* Ligne de fond visuelle pour faire "Frise du temps" */}

        
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-2 bg-slate-700 -z-10 rounded-full"></div>

        {vraieReponse.map((item, index) => (
          <div
            key={item.nom + index}
            className={`flex flex-col items-center bg-slate-800 rounded-xl p-2 md:p-3 border-4 flex-1 min-w-[120px] shadow-lg border-purple-500 transition-all`}
          >
            <img src={item.image} alt={item.nom} className="w-full h-24 md:h-40 object-cover rounded-lg pointer-events-none" />
            <p className="text-white font-bold text-center mt-2 text-xs md:text-sm h-10 flex items-center justify-center pointer-events-none">
              {item.nom}
            </p>

            {/* Boutons Mobiles (Invisibles en review) */}
            {!review && (
              <div className="flex w-full justify-between mt-2 md:hidden">
                <button onClick={() => moveItem(index, -1)} className="bg-purple-600 text-white p-1 rounded hover:bg-purple-500 px-3 font-bold" disabled={index === 0}>◀</button>
                <button onClick={() => moveItem(index, 1)} className="bg-purple-600 text-white p-1 rounded hover:bg-purple-500 px-3 font-bold" disabled={index === liste.length - 1}>▶</button>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
      )}
    </div>
  );
};



const ButtonRep = ({ reponse, onChoixFait, isClicked, theme }) => {
  const styleActif = isClicked ? theme.button.stateQcm.pressedGame : "";
  return (
    <button
      onClick={() => { onChoixFait(reponse) }}
      className={`${theme.button.gameAnswer} ${styleActif}`}
    >
      {reponse}
    </button>
  );
}

const BoutonValide = ({changeEtat, theme, etat, isChef}) => {
  return (
      <button disabled={!isChef}
        onClick={() => {changeEtat(!etat)}} 
        className={` ${etat ? theme.button.stateBtnBon.correct : theme.button.stateBtnBon.wrong}`}
      >Bon</button>
  );
}

const ButtonChoix = ({ valeur, changerChoix, isSelected, isChef, theme }) => {
  const styleActif = isSelected ? theme.button.stateQcm.pressed : "";
  return (
    <button
      disabled={isSelected || !isChef}
      onClick={() => { changerChoix(valeur) }}
      className={`${ isChef && (!isSelected) ? theme.button.choice : theme.button.choiceDisabled} ${styleActif}`}
    >
      {valeur}
    </button>
  );
}

const PhotoProfil = () => {
  const [photoProfil, setPhotoProfil] = useState("profil.png");
  const listePhoto = ['profil.png', 'moustache.png'];
  const [transition, setTransition] = useState(false);

  const changerPhoto = () => {
    setTransition(true);
    setTimeout(() => {
      const choixPossibles = listePhoto.filter(img => img !== photoProfil);
      const index = Math.floor(Math.random() * choixPossibles.length);
      setPhotoProfil(choixPossibles[index]);
      setTransition(false);
    },300)
  }

  return (
    <div className="relative h-44 w-40 flex items-end justify-center group cursor-pointer" onClick={changerPhoto}>
      {/* 1. COUCHE ARRIÈRE */}
      <div className={`absolute bottom-0 w-40 h-40 bg-white rounded-full border-4 border-purple-600 transition-all duration-300`}></div>
      {/* 2. COUCHE MILIEU */}
      <div className={`relative z-10 w-36 h-full mb-1 items-end justify-center overflow-visible transition-all duration-300 -translate-y-3 ${transition ? "translate-y-50" : "translate-y-0 opacity-100 group-hover:-translate-y-6"}`}>
         <img className="h-40 w-40 object-contain drop-shadow-xl" src="/images/avatar/profil.png" alt="Avatar" />
      </div>
      {/* 3. COUCHE AVANT (Cache) */}
      <div className="absolute top-full z-20 w-50 h-50 bg-purple-400 pointer-events-none "></div>
      <div className={`absolute bottom-0 z-20 w-40 h-20 rounded-b-full border-b-4 border-l-4 border-r-4 border-purple-600 pointer-events-none transition-all duration-300 shadow-[0_30px_0_#c084fc]`}></div>
      <div className={`absolute bottom-0 z-20 w-40 h-20 rounded-b-full border-b-4 border-l-4 border-r-4 border-purple-600 pointer-events-none transition-all duration-300 shadow-[0_12px_0_rgb(147,51,234)]`}></div>
      
    </div>
  );
}

const QuestionOuverte = ({remplirText, valueText, review, theme}) => {
  return (
    <div className='w-200'>
      {!review ? // NORMAL
      
      <input 
          disabled={review} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          onChange={(e) => remplirText(e.target.value)} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>  

        : // REVIEW
        

        <div>
                  
                  <input 
          disabled={true} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>  
                  </div>
                 

        }
    
    
      </div>
  );
}

const SuivantReview = ({passerSuivant, theme}) => {
  return (
        <button onClick={() => { passerSuivant() }} className={theme.button.primary}>Réponse Suivante</button>
  );
}

const ButtonPret = ({ tousPrets, lancerPartieSocket, texte, theme }) => {
  // Application du style primaire si prêt, sinon style gris
  return (
    <button
      disabled={!tousPrets}
      onClick={lancerPartieSocket}
      className={` 
        ${!tousPrets ? theme.button.disabled : theme.button.primary}
      `} 
    >
      {texte}
    </button>
  );
};

const BorderTimer = ({ children, visible, progress, color = "#3b82f6", isFullscreen }) => {
  const [vraimentVisible, setVraimentVisible] = useState(false);
  const strokeWidth = 8;
  const radius = isFullscreen ? 0 : 24;

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => { setVraimentVisible(true); }, 500); 
    } else {
      setVraimentVisible(false);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.20,0.64,1)]
      ${isFullscreen ? "fixed inset-0 w-screen h-screen bg-slate-900 z-[100]" : "relative z-40"}`}
    >
      {/* LA CORRECTION EST ICI : On a déplacé le style top/left/width/height sur le <svg> */}
      <svg 
        className="absolute pointer-events-none overflow-visible" 
        style={{ 
          top: strokeWidth / 2, 
          left: strokeWidth / 2, 
          width: `calc(100% - ${strokeWidth}px)`, 
          height: `calc(100% - ${strokeWidth}px)`, 
          zIndex: 50, 
          opacity: vraimentVisible ? 1 : 0, 
          transition: 'opacity 0.2s' 
        }}
      >
        {/* Les <rect> n'ont plus de calculs complexes, juste x=0, y=0 et 100% */}
        <rect 
          x="0" y="0" width="100%" height="100%" 
          style={{ transition: 'all 0.5s ease-in-out' }} 
          rx={radius} fill="none" stroke="rgba(226, 232, 240, 0.2)" strokeWidth={strokeWidth} 
        />
        <rect 
          x="0" y="0" width="100%" height="100%" 
          style={{ transition: 'stroke-dashoffset 0.1s linear, all 0.5s ease-in-out' }} 
          rx={radius} fill="none" stroke={color} strokeWidth={strokeWidth} 
          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} strokeLinecap="round" 
        />
      </svg>
      
      <div className="relative z-10 w-full h-full flex items-center justify-center"> 
         {children}
      </div>
    </div>
  );
};

const Chat = ({ onClick, historiqueChat, theme }) => {
  const [texteChat, changerTexteChat] = useState("");
  const finChatRef = useRef(null);
  const [open, setOpen] = useState(false);

  const scrollToBottom = () => {
    finChatRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [historiqueChat, open]);

  return (
    <div className={`fixed bottom-0 right-10 z-50 flex flex-col bg-purple-400 w-80 h-96 rounded-2xl shadow-[0_120px_0_rgb(147,51,234)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.20,0.64,1)] ${open ? "-translate-y-20" : "translate-y-full"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`absolute -top-12 right-0 h-12 px-6 ounded-t-xl border-t-4 border-l-4 border-r-4 border-purple-600 border-b-0 font-bold text-lg transition-all duration-300 flex items-center gap-2 border-2 border-purple-600  bg-slate-100 text-purple-600 p-2 rounded-xl font-bold text-xl transition-all shadow-[0_6px_0_rgb(147,51,234)] ${COLORS.hover} active:translate-y-[6px] active:shadow-none`}
      >
        {open ? "▼ Fermer" : "▲ Chat"}
      </button>

      <div className='h-max p-9'>
        <div className=' h-70 overflow-y-scroll shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] rounded-xl p-2 text-purple-900' >
          {historiqueChat.map ((chat, index) => (
            <p key={index}>{chat}</p>
          ))}
          <div ref={finChatRef} />
        </div>

        <div className='flex flex-row'>
          <input
            type="text" placeholder='Écris ici...' value={texteChat} 
            onChange={(e) => changerTexteChat(e.target.value)} 
            className={`p-3 border-2 mt-1 text-purple-800 border-[rgba(0,0,0,0.1)] transition-all duration-100 outline-none focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] rounded-xl w-full ${texteChat === "" ? "" : "shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]" }`}
          />
          <button onClick={() => {onClick(texteChat); changerTexteChat(""); }} className='w-max border border-[rgba(0,0,0,0.3)] rounded-xl font-bold text-[rgba(0,0,0,0.5)] shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:cursor-pointer active:translate-y-[3px] active:shadow-none mt-1 ml-1 mb-1 p-1 pl-5 pr-5'>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};


const OtpInput = ({ length = 6, onComplete , theme, pseudoExist, cantJoin}) => {
  // Un tableau de chaînes vides pour stocker chaque caractère
  const [otp, setOtp] = useState(new Array(length).fill(""));
  
  // Création de refs pour pouvoir manipuler le focus de chaque input
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cantJoin) {
      setOtp(new Array(length).fill("")); // Vide les cases
      setTimeout(() => {
        inputsRef.current[0]?.focus();  
      }, 1001)
          // Replace le focus au début
    }
  }, [cantJoin, length]);

  const handleChange = (element, index) => {
    const value = element.value.toUpperCase();
    if (isNaN(value) && value !== "" && !/[a-zA-Z]/.test(value)) return; // Optionnel: restreindre ici

    let newOtp = [...otp];
    // On ne prend que le dernier caractère tapé (pour éviter les bugs de copier-coller)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Déplacer le focus vers la case suivante si on a écrit quelque chose
    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    // Si tout est rempli, on peut appeler une fonction de rappel
    if (newOtp.every(v => v !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };



  const handleKeyDown = (e, index) => {
    // Si on appuie sur "Retour arrière" et que la case est vide, on revient en arrière
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className={`flex flex-row gap-2 ${pseudoExist ? theme.input.lobby : theme.input.disabled}  ${cantJoin ? "animate-shake" : ""}`}>
      {otp.map((data, index) => (
        <div key={index} className="flex flex-col items-center">
          <input
            disabled={!pseudoExist || cantJoin}
            type="text"
            maxLength="1"
            ref={(el) => (inputsRef.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-10 h-12 text-center ${!pseudoExist ? "cursor-not-allowed" : ""}  ${cantJoin ? theme.text.code.wrong : theme.text.code.normal}  `}
          />
        </div>
      ))}
    </div>
  );
};


const QuestionDrapeau = ({image,theme,remplirText,review,valueText}) => {
  return (
    <div className='flex flex-col justify-center items-center gap-10'>
    <img 
        src={image} 
        alt="Drapeau à deviner" 
        className="w-48 h-auto rounded"
      />
      

    {!review 
    ? //NORMAL

    <div className='w-200'>
    <input 
          disabled={review} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          onChange={(e) => remplirText(e.target.value)} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>
      </div>

    : //REVIEW

    <div className='w-200'>
    <input 
          disabled={review} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          onChange={(e) => remplirText(e.target.value)} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>
      </div>


  }
    
      </div>
  )
}

const MemeFlou = ({image,theme,remplirText,review,valueText}) => {
  return (
    <div className='flex flex-col justify-center items-center gap-10'>
    <img 
        src={image} 
        alt="Drapeau à deviner" 
        className={`w-48 h-auto rounded ${review ? 'blur-0' : 'blur-sm'}`}
      />
      

    {!review 
    ? //NORMAL

    <div className='w-200'>
    <input 
          disabled={review} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          onChange={(e) => remplirText(e.target.value)} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>
      </div>

    : //REVIEW

    <div className='w-200'>
    <input 
          disabled={review} 
          type="text" 
          placeholder='Réponse...' 
          value={valueText} 
          onChange={(e) => remplirText(e.target.value)} 
          className={`${theme.input.game} ${review ? "text-center" : ""}`}
        ></input>
      </div>


  }
    
      </div>
  )
}

const QuestionCodeTrou = ({ code, langage, theme, remplirText, review, valueText }) => {
  
  const renderCodeAvecTrou = (texteCode) => {
    // 1. Sécurité : si Mistral a oublié le code ou a buggé
    if (!texteCode) return <span className="text-rose-500">Erreur de génération du code...</span>;
    
    // 2. Sécurité : si Mistral a renvoyé un tableau (Array) au lieu d'un texte
    if (Array.isArray(texteCode)) {
      texteCode = texteCode.join('\n');
    } 
    // 3. Sécurité : si c'est un autre format bizarre, on force la conversion en texte
    else if (typeof texteCode !== 'string') {
      texteCode = String(texteCode);
    }

    // Maintenant on est sûr à 100% que c'est un String, .split() fonctionnera toujours
    const parties = texteCode.split('___');
    
    return parties.map((partie, index) => (
      <span key={index}>
        {partie}
        {index < parties.length - 1 && (
          <span className="inline-block px-4 mx-1 bg-slate-700/80 border-2 border-dashed border-slate-400 rounded-md text-transparent animate-pulse shadow-inner">
            ????
          </span>
        )}
      </span>
    ));
  };

  return (
    <div className='flex flex-col justify-center items-center gap-4 w-full max-w-2xl'>
      
      <div className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-[0_8px_0_rgb(30,41,59)] border-2 border-slate-700 flex flex-col">
        {/* Header du terminal (Fixe) */}
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700 shrink-0">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{langage}</span>
        </div>
        
        {/* LA ZONE DE CODE AVEC LE SCROLL (max-h-64 crée la limite de hauteur) */}
        <div className="p-4 md:p-6 overflow-y-auto overflow-x-hidden max-h-64 custom-scrollbar">
          <pre className="font-mono text-emerald-400 text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words">
            {renderCodeAvecTrou(code)}
          </pre>
        </div>
      </div>

      
    </div>
  );
}


// ==================================================================================
// MAIN APP COMPONENT
// ==================================================================================

export default function App() {

  const [typeJeu, setTypeJeu] = useState("qcm");
  const [gameStat, setGameStat] = useState("lobby");
  const [questionData, setQuestionData] = useState(null);
  const [indexQuestion, setIndexQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nombreQuestions, setNombreQuestions] = useState(0);
  const [repOuverte, setRepOuverte] = useState("");
  const [lobby, setLobby] = useState([]);
  const [pseudo, setPseudo] = useState("");
  const [isChef, setIsChef] = useState(false);
  const [isPret, setIsPret] = useState(false);
  const [inRoom, setinRoom] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tempsQuestion, setTempsQuestion] = useState(0);
  const [pseudoReview, setPseudoReview] = useState("");
  const [estBon, setEstBon] = useState(false);
  const [historiqueChat, setHistoriqueChat] = useState([]);
  const [listeResultat, setListeResultat] = useState([]);
  const [resultatsAffiches, setResultatsAffiches] = useState([]);
  const [indexResultat, setIndexResultat] = useState(0);
  const [hasSent, setHasSent] = useState(false);
  const [progress, setProgress] = useState(1);
  const endTimeRef = useRef(null);    
  const [roomCode, setRoomCode] = useState("");
  const [cantJoin, setCantJoin] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const [isWikiFullscreen, setIsWikiFullscreen] = useState(false);


  useEffect(() => {
  const permanentPseudo = localStorage.getItem('pseudoQuiz');
  if (permanentPseudo) {
    console.log("Pseudo récupéré du stockage :", permanentPseudo);
    setPseudo(permanentPseudo);
  }
}, []); 
  
  
  // ICI : On sélectionne le thème (pour l'instant hardcodé à 'comic' comme dans ton code)
  const [currentThemeName, setCurrentThemeName] = useState("comic");
  const theme = THEMES_CONFIG[currentThemeName];

  const choixNombreQuestions = ["5", "10", "20", "30"]

  let dimensionDico = {
    lobby : "w-100 h-155",
    loading : "w-180 h-40",
    playing : "w-400 h-220",
    review : "w-400 h-220",
    resultat : "w-200 h-200"
  }

  let dimensionContour;
  if (loading) {
    dimensionContour = dimensionDico["loading"];
  } else {
    dimensionContour = dimensionDico[gameStat] || "w-300 h-150";
  }

  useEffect(() => {
    let frame;
    const update = () => {
      if (!endTimeRef.current || gameStat !== "playing" || loading) {
        frame = requestAnimationFrame(update);
        return;
      }
      const now = Date.now();
      const remaining = endTimeRef.current - now;
      const newProgress = Math.max(0, remaining / ((tempsQuestion-0.5) * 1000));
      setProgress(newProgress);
      if (newProgress > 0) {
        frame = requestAnimationFrame(update);
      }
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [gameStat, loading, tempsQuestion]);

  useEffect(() => {
    if (timeLeft === tempsQuestion) setHasSent(false);
    if (timeLeft === 0 && gameStat === "playing" && !hasSent) {
      socket.emit("send_rep", repOuverte);
      setHasSent(true);
    }
  }, [timeLeft, gameStat, hasSent]);

  useEffect(() => {
    if (gameStat === "resultat" && indexResultat < listeResultat.length) {
      const timer = setTimeout(() => {
        setResultatsAffiches((prev) => [...prev, listeResultat[indexResultat]]);
        setIndexResultat((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStat, indexResultat, listeResultat])

  useEffect(() => {
    if (!socket) {
      socket = io('https://culture-de-geek.onrender.com', { reconnectionAttempts: 5 });
      socket.on('connect', () => { console.log("Connecté avec le socket :", socket.id); });
    }

    socket.on('update_lobby', (data) => joueurRejoins(data));
    socket.on('update_pret', (lobby) => updateLobby(lobby));
    socket.on("update_etat", (etat) => {setEstBon(etat)});  
    socket.on('update_chat', (texte) => { setHistoriqueChat((prev) => [...prev, texte]); });
    socket.on('lobby_joined', (roomCode) => { setinRoom(true); setRoomCode(roomCode); console.log("joined")});
    socket.on('room_not_found', () => { 
      setCantJoin(true); 
      setTimeout(() => setCantJoin(false), 1000);  
    });

    if (!inRoom) {
       return () => {
        socket.off('update_lobby');
        socket.off("connect");
        socket.off('update_pret');
        socket.off('lobby_joined');
        socket.off('update_etat');
        socket.off("update_chat");
       }
    }

    socket.on('timer_update', (t) => { setTimeLeft(t); });
    socket.on('resultats', (listeResultat) => {
      setGameStat("resultat");
      setListeResultat(listeResultat);
    })
    socket.on('game_started', ({data,type,difficulty,duration}) => {
      setTempsQuestion(duration);
      setTimeLeft(duration);
      setDifficulty(difficulty);
      setIndexQuestion(1);
      setGameStat("playing");
      endTimeRef.current = Date.now() + (duration * 1000);
      setTypeJeu(type);
      setQuestionData(data);
      setRepOuverte("");
      setLoading(false);
    });

    socket.on('new_question', ({data,type,duration,difficulty}) => {
      setTimeLeft(duration);
      console.log(data);
      setTempsQuestion(duration);
      setDifficulty(difficulty);
      endTimeRef.current = Date.now() + (duration * 1000);
      setTypeJeu(type);
      setQuestionData(data);
      setRepOuverte("");
      setLoading(false);
      setIsWikiFullscreen(false);
      setTimeout(() => {
        setIndexQuestion(prev => prev + 1);
      }, 500)
    });

    socket.on('loading_status', (isLoading) => { setLoading(isLoading); })
    socket.on('question_review', (question,type,difficulty,rep,pseudo) => {
      setGameStat("review");
      setDifficulty(difficulty);
      setQuestionData(question);
      setPseudoReview(pseudo);
      setRepOuverte(rep);
      setTypeJeu(type);
      
    })
    socket.on('updateNbQuestions', (n) => { setNombreQuestions(n); });

    return () => {
      socket.off('update_lobby');
      socket.off('game_started');
      socket.off('new_question');
      socket.off('loading_status');
      socket.off('update_nb_questions');
      socket.off('connect');
      socket.off('lobby_joined');
      socket.off('timer_update');
    };
  }, [inRoom]);

  const rejoindreLobby = (roomCode) => {
    if (pseudo) {
      localStorage.setItem('pseudoQuiz', pseudo);
      socket.emit('join_lobby', { pseudo: pseudo, permanentId: permanentId, roomCode: roomCode });
      
    }
  };

  const creerLobby = () => { 
    if (pseudo) {
      localStorage.setItem('pseudoQuiz', pseudo);
      socket.emit('create_lobby', { pseudo: pseudo, permanentId: permanentId });
    }

  }
  const joueurRejoins = (data) => {
    if (data.joueurs) {
      console.log("ezae");
      updateLobby(data.joueurs);
      setNombreQuestions(data.nbQuestions);
    } else {
        updateLobby(data);
    }
  }
  const seMettrePretSocket = () => { setIsPret(true); socket.emit('ready'); }
  const updateLobby = (lobby) => {
    setLobby(lobby);
    if (lobby.length > 0) {
      if (lobby[0].permanentId === permanentId) { setIsChef(true); }
    }
  }
  const annulerPretSocket = () => { setIsPret(false); socket.emit('unready'); }
  const isinRoom = () => { return lobby.find(j => j.permanentId === permanentId); }
  const lancerPartieSocket = () => {
    setLoading(true);
    socket.emit('start_game', nombreQuestions);
  };
  const nextReview = () => {
    
    if (gameStat === "review") { socket.emit('next_review', estBon); }
    else { socket.emit('next_review', null); }
  }
  const tousPrets = () => { return lobby.every(j => j.pret); }
  const changeEtat = (etat) => { if (isChef) socket.emit("change_etat", etat); }
  const changerNbQuestions = (n) => { socket.emit('change_nb_questions', n); }
  const changerTheme = (n) => { socket.emit('change_theme', n); }
  const envoyerChat = (texte) => { socket.emit('send_chat', texte); }


  const afficherContenuQuestion = (isReviewing) => {
  switch (typeJeu) {  
    case "ouverte":
      return ( // <-- 1. Parenthèse obligatoire sur la même ligne que le return
    <div className='flex flex-col items-center'>
      
      {/* --- L'en-tête de la question --- */}
      <div className='flex flex-row w-full gap-2 mb-8'>    
        <h1 className={theme.container.glassHeader}>
          {questionData?.question}
        </h1>
        <h1>
          Pts : {difficulty}
        </h1>
      </div>
      
      {isReviewing ? <p className='text-center text-4xl mb-5 font-bold text-slate-100 drop-shadow-md w-full'> {pseudoReview} </p> : ""}
      
      {/* --- Les boutons de réponse --- */}
        {/* 2. Plus besoin de vérifier typeJeu, on fait directement la boucle (map) */}
        <QuestionOuverte 
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            theme={theme}
        /> {/* <-- 3. N'oublie pas de fermer la boucle map ici */}

       {isReviewing ? <div className='w-200 mt-10'>
                    <label className={`${theme.text.label} ml-15`}> Réponse : </label>
                    <div className={theme.input.game}>{questionData.reponse}</div>
                    </div> : "" }

    </div>
    );

    case "qcm":
      return ( // <-- 1. Parenthèse obligatoire sur la même ligne que le return
    <div className='flex flex-col h-full w-full pb-8'>
      
      {/* --- L'en-tête de la question --- */}
      <div className='flex flex-row w-full gap-2 mb-8'>    
        <h1 className={theme.container.glassHeader}>
          {questionData?.question}
        </h1>
        <h1>
          Pts : {difficulty}
        </h1>
      </div>

      {isReviewing ? <p className='text-center text-4xl mb-5 font-bold text-slate-100 drop-shadow-md w-full'> {pseudoReview} </p> : ""}
      
      {/* --- Les boutons de réponse --- */}
      <div className='flex flex-wrap justify-center mb-5 gap-4'>
        {/* 2. Plus besoin de vérifier typeJeu, on fait directement la boucle (map) */}
        
      

        {questionData.options.map((option, index) => (
          isReviewing ? 
          <div key={index}>
            <ButtonRepReview 
              key={index}
              reponse={option}
              isCorrect={questionData.reponse === option}
              clicked={repOuverte.toLowerCase() === option.toLowerCase()}
              theme={theme}
            />
          </div>
          :
          <ButtonRep 
            key={index}
            reponse={option}
            isClicked={repOuverte === option}
            onChoixFait={(rep) => { setRepOuverte(rep); }}
            theme={theme}
          />
        ))} {/* <-- 3. N'oublie pas de fermer la boucle map ici */}
      </div>

    </div>
    );

    case "drapeau": // <-- Ton 3ème type de jeu (exemple)
      return (
        <div className='flex flex-col items-center'>
      
      {/* --- L'en-tête de la question --- */}
      <div className='flex flex-row w-full gap-2 mb-8'>    
        <h1 className={theme.container.glassHeader}>
          {questionData.question}
        </h1>
        <h1>
          Pts : {difficulty}
        </h1> 
      </div>

      <QuestionDrapeau image={questionData.image} 
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            theme={theme}
        />

      {isReviewing ? <p className='text-center text-4xl mb-5 font-bold text-slate-100 drop-shadow-md w-full'> {pseudoReview} </p> : ""}
 
      
      

      {isReviewing ? <div className='w-200 mt-10'>
                    <label className={`${theme.text.label} ml-15`}> Réponse : </label>
                    <div className={theme.input.game}>{questionData.reponse}</div>
                    </div> : "" }  

    </div>
        
      );

    case 'codeTrou':
      return (
        <div className='flex flex-col items-center w-full'>
          <div className='flex flex-row w-full gap-2 mb-8'>    
            <h1 className={theme.container.glassHeader}>
              {questionData.question}
            </h1>
            <h1>
              Pts : {difficulty}
            </h1> 
          </div>

          <QuestionCodeTrou 
            code={questionData.code} 
            langage={questionData.langage}
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            theme={theme}
          />

          {isReviewing ? <p className='text-center text-4xl mt-5 mb-5 font-bold text-slate-100 drop-shadow-md w-full'> {pseudoReview} </p> : ""}

          <div className='w-full max-w-md mt-2'>
        <input 
          disabled={isReviewing} 
          type="text" 
          placeholder='Tape le code manquant...' 
          value={repOuverte} 
          onChange={(e) => setRepOuverte(e.target.value)} 
          className={`${theme.input.game} ${isReviewing ? "text-center" : ""} font-mono`}
        />
      </div>
          
          {isReviewing ? 
            <div className='w-full max-w-md mt-4 flex flex-col items-center'>
              <label className={`${theme.text.label}`}> Vraie Réponse : </label>
              <div className={`${theme.input.game} bg-emerald-100 border-emerald-500 text-emerald-800 font-mono flex items-center justify-center`}>
                {questionData.reponse}
              </div>
            </div> 
          : ""}  
        </div>
      );


    case 'devineMeme':
      return (
        <div className='flex flex-col items-center'>
      
      {/* --- L'en-tête de la question --- */}
      <div className='flex flex-row w-full gap-2 mb-8'>    
        <h1 className={theme.container.glassHeader}>
          {questionData.question}
        </h1>
        <h1>
          Pts : {difficulty}
        </h1> 
      </div>

      <MemeFlou image={questionData.image} 
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            theme={theme}
        />

      {isReviewing ? <p className='text-center text-4xl mb-5 font-bold text-slate-100 drop-shadow-md w-full'> {pseudoReview} </p> : ""}
 
      
      

      {isReviewing ? <div className='w-200 mt-10'>
                    <label className={`${theme.text.label} ml-15`}> Réponse : </label>
                    <div className={theme.input.game}>{questionData.reponse}</div>
                    </div> : "" }  

    </div>
      );

    case 'chronologie':
      return (
        <div className='flex flex-col items-center w-full'>
          <div className='flex flex-row w-full gap-2 mb-2 '>    
            <h1 className={theme.container.glassHeader}>
              {questionData.question}
            </h1>
            <h1>Pts : {difficulty}</h1> 
          </div>

          {isReviewing && <p className='text-center text-4xl mt-8 font-bold text-white uppercase drop-shadow-md'>{pseudoReview}</p>}

          <QuestionChronologie 
            items={questionData.items} 
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            vraieReponse={questionData.reponse}
            theme={theme}
          />

          
          
        </div>
      );

    case 'petitBac':
      return (
        <div className='flex flex-col items-center w-full'>
          <div className='flex flex-row w-full gap-2 mb-6'>    
            <h1 className={theme.container.glassHeader}>
              {questionData.question}
            </h1>
            {/* Affiche le nombre de points gagnés en temps réel pendant la review ! */}
            <h1>Pts : {isReviewing && Array.isArray(estBon) ? estBon.filter(Boolean).length : difficulty}</h1> 
          </div>

          <QuestionPetitBac 
            categories={questionData.categories}
            lettre={questionData.lettre}
            remplirText={setRepOuverte} 
            valueText={repOuverte}
            review={isReviewing}
            theme={theme}
            isChef={isChef}
            etatLignes={estBon}
            changeEtat={changeEtat}
          />

          {isReviewing && (
             <div className="mt-8 relative z-10">
               <div className="bg-purple-600 text-white px-8 py-2 rounded-xl font-black text-2xl uppercase tracking-wider shadow-[0_4px_0_rgb(107,33,168)]">
                 {pseudoReview}
               </div>
             </div>
          )}
        </div>
      );

    case 'bombParty':
      return (
        <div className='flex flex-col items-center w-full'>
          {/* En-tête classique de la question */}
          <div className='flex flex-row w-full justify-center gap-2 mb-2'>    
            <h1 className={theme.container.glassHeader}>
              {questionData.question}
            </h1>
          </div>

          {/* Le super composant Bomb Party */}
          <QuestionBombParty 
            socket={socket}           // Très important pour envoyer/recevoir les mots
            review={isReviewing}      // Savoir si on est en phase de jeu ou de score
            pseudoReview={pseudoReview} 
            estBon={estBon}           // Ici, estBon contiendra le nombre de vies restantes (le score)
            theme={theme}
          />
        </div>
      );

    case 'wikipedia':
      return (
        <div className='flex flex-col items-center w-full h-full'>
          {/* NOUVEAU : Le titre disparaît complétement si isWikiFullscreen est vrai */}
          {!isWikiFullscreen && (
            <div className='flex flex-row w-full justify-center gap-2 mb-4 shrink-0'>    
              <h1 className={theme.container.glassHeader}>
                {questionData.question}
              </h1>
            </div>
          )}

          <QuestionWikipedia 
            depart={questionData.depart}
            arrivee={questionData.arrivee}
            socket={socket}
            review={isReviewing}
            pseudoReview={pseudoReview} 
            valueText={repOuverte}
            estBon={estBon}
            theme={theme}
            // NOUVEAU : On connecte les variables du parent à l'enfant
            isFullscreen={isWikiFullscreen}
            toggleFullscreen={() => setIsWikiFullscreen(!isWikiFullscreen)}
          />
        </div>
      );

    case "image": // <-- Ton 4ème type de jeu (exemple)
      return (
        <QuestionImage 
           // Tes props ici
        />
      );

    default:
      // Sécurité : si le type de jeu est inconnu, on n'affiche rien ou un message d'erreur
      return <p className="text-white">Chargement du type de question...</p>;
  }
};



  // ==================================================================================
  // RENDU JSX
  // ==================================================================================

  return (
    <div style={{backgroundImage: `${theme.bg.image}`,backgroundColor: `${theme.bg.color}`}} className={`bg-cover bg-center h-screen w-screen overflow-hidden flex items-center justify-center relative`}>
      
      <Chat historiqueChat={historiqueChat} onClick={(texte) => envoyerChat(texte)} theme={theme}/>
      
      <BorderTimer progress={progress} visible={gameStat === "playing" && !loading} color={timeLeft < 5 ? "#ef4444" : "#3b82f6"} isFullscreen={isWikiFullscreen}>
        
        {/* NOUVEAU : La carte prend !w-full !h-full et annule ses bordures arrondies en plein écran */}
       <div 
  className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ring-8 ring-inset ring-[rgba(226,232,240,0.3)] flex flex-col relative overflow-hidden
    ${isWikiFullscreen 
      ? "fixed inset-0 !max-w-none !max-h-none bg-slate-900 rounded-none border-none !p-0 z-[101]" 
      : `${theme.container.card} shadow-2xl`
    }`}
  style={{
    // Si on n'est pas en plein écran, on applique les dimensions du dico manuellement
    width: isWikiFullscreen ? '100vw' : `${dimensionContour.split(' ')[0].replace('w-', '') * 4}px`,
    height: isWikiFullscreen ? '100vh' : `${dimensionContour.split(' ')[1].replace('h-', '') * 4}px`,
  }}
>
          
          {(gameStat === "lobby") && !loading ? ( /// Lobby
            !inRoom ?
            <>
              <div className='flex flex-col gap-8 w-96 rounded-xl items-center p-7'>
                <PhotoProfil />
                <div className='w-full z-45'>
                  <label className={theme.text.title}> Pseudo </label>
                  <input 
                    value={pseudo} 
                    onChange={(e) => setPseudo(e.target.value)}   
                    placeholder="Écris ton pseudo..." 
                    className={theme.input.lobby}
                  />
                </div>  

                <button onClick={creerLobby} className={`w-full ${theme.button.primary}`}>
                  {isinRoom() ? "Changer de pseudo" : "Créer le salon"}
                </button>

                <div className='flex flex-row'> 

                  <OtpInput pseudoExist={pseudo.length > 0} cantJoin={cantJoin} theme={theme} onComplete={(roomCode) => rejoindreLobby(roomCode)}/>
                </div>
              </div>
            </>
            :
            <div className='flex flex-row w-full'>
              <div className='w-full flex flex-col p-5'>
                <div>
                  <h2>
                    Code de la partie : {roomCode}
                  </h2>
                </div>

                <div className="bg-slate-100 p-4 rounded-xl min-h-[100px] mb-4 shadow-inner">
                  <h2 className="font-bold border-b mb-2 text-purple-800">Joueurs connectés ({lobby.length}) :</h2>
                  {lobby.map((j,index) => (
                    <div key={j.id} className='flex flex-row'>
                      <p className={`${j.pret ? "text-green-600" : "text-blue-600"} font-medium`}>● {j.pseudo} {j.id === socket?.id ? "(Moi)" : j.pret ? "(Prêt)" : ""}</p>
                      {index===0 ? <img className='pl-1 pt-1 w-5 h-5' src='/images/couronne.png' alt="chef"></img> : ""}
                    </div>
                  ))}
                </div>
                

                <label className={theme.text.label}>Nombre de questions</label>
                <div className='flex flex-row mb-5'>
                  {choixNombreQuestions.map((nb,index) => {
                    const isSelect = nombreQuestions === nb;
                    return (
                      <ButtonChoix valeur={nb} key={index} changerChoix={changerNbQuestions} isSelected={isSelect} isChef={isChef} theme={theme}/>
                    )
                  })}
                </div>
                
                {isChef 
                  ? <ButtonPret theme={theme} tousPrets={tousPrets()} lancerPartieSocket={() => lancerPartieSocket()} texte="LANCER LA PARTIE"/>
                  : isPret 
                    ? <ButtonPret theme={theme} tousPrets={isinRoom()} lancerPartieSocket={() => annulerPretSocket()} texte="PAS PRÊT"/>
                    : <ButtonPret theme={theme} tousPrets={isinRoom()} lancerPartieSocket={() => seMettrePretSocket()} texte="PRÊT"/>
                }
              </div>
            </div>
            
          ) : (
            (gameStat === "playing" || loading) ? /// EN JEU
            <div className='h-full w-full flex flex-col'>
              
              {/* NOUVEAU : On cache le chrono si isWikiFullscreen est vrai */}
              {(!loading && !isWikiFullscreen) && (
                <div className="shrink-0 flex flex-col items-center pt-6 z-10">
                  <div className={`text-4xl font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse ease-linear' : 'text-blue-600'}`}>
                      {timeLeft}s
                  </div>
                </div>
              )}

              {/* NOUVEAU : On supprime les paddings (p-6) de la zone centrale si on est en plein écran */}
              <div className={`flex-1 w-full flex flex-col items-center overflow-hidden ${isWikiFullscreen ? "p-0" : "p-6"}`}>
                {loading ? (
                  <div className="m-auto flex items-center justify-center">
                    <h1 className='text-slate-100 font-black text-5xl text-center'>{gameStat === "review" ? "Résultats..." :  "Génération de la question..."}</h1>
                  </div>
                ) : (
                  afficherContenuQuestion(false)
                )}
              </div>
              
              {/* NOUVEAU : On cache la barre de progression si isWikiFullscreen est vrai */}
              {(!loading && !isWikiFullscreen) && (
                <div className='shrink-0 w-full p-6 pt-2 z-10'>
                  <div style={{backgroundColor:"rgba(147,51,234, 0.3)"}} className='w-full h-4 rounded-full overflow-hidden shadow-inner'>
                      <div className="bg-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(indexQuestion / nombreQuestions) * 100}%` }}></div> 
                  </div>
                </div>
              )}

            </div>
          
          : /// REVIEW
          gameStat === "review" ? 
          <div className='h-full w-full flex flex-col'>
            
            {/* 1. ZONE CONTENU (Scrollable) */}
            <div className='flex-1 overflow-y-auto w-full p-6 pb-2 flex flex-col items-center custom-scrollbar'>
               {afficherContenuQuestion(true)}
            </div>

            {/* 2. ZONE BOUTONS (Fixe en bas) */}
            <div className="shrink-0 w-full p-4 px-6 bg-slate-800/50 border-t border-slate-700/50 flex justify-end gap-4 z-10">
              {typeJeu !== "petitBac" && typeJeu !== "bombParty" && (
                <BoutonValide changeEtat={(etat) => changeEtat(etat)} theme={theme} etat={estBon} isChef={isChef}/>
              )}
              {isChef ? <SuivantReview theme={theme} passerSuivant={nextReview}/> : null}
            </div>

          </div>

          :
          gameStat === "resultat" ?
          <div className='w-full max-w-4xl p-5'>
            <h2 className="text-3xl font-black text-white text-center mb-8">RÉSULTATS</h2>
            <div className="flex flex-col gap-2">
              {resultatsAffiches.map((result,index) => (
                <div key={index} className="bg-white/90 p-4 rounded-xl flex justify-between items-center font-bold text-purple-800 animate-bounce"> 
                  <span>{index + 1}. {result.pseudo}</span>
                  <span className="text-2xl">{result.score} pts</span>
                </div>
              ))}
            </div>
          </div>
          : ""
          )}
        </div>
      </BorderTimer>
    </div>
    
  );
}