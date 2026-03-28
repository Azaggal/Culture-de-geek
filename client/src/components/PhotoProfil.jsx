
import React, { useState } from 'react';
import { COMPONENTS } from '../theme';

const AVAILABLE_AVATARS = [
  { id: 0, img: "0", name: "Le Bleu" },
  { id: 1, img: "1", name: "Le Cyclope" },
  { id: 2, img: "2", name: "La Plante" },
  { id: 3, img: "3", name: "Le Mutant" },
  { id: 4, img: "4", name: "Le Boss" },
  { id: 5, img: "5", name: "L'Ancien" },
];

export const PhotoProfil = () => {
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
    }, 300);
  };

  return (
    <div className={COMPONENTS.photoProfil.container} onClick={changerPhoto}>
      {/* 1. COUCHE ARRIÈRE */}
      <div className={COMPONENTS.photoProfil.bgCircle}></div>
      {/* 2. COUCHE MILIEU */}
      <div className={`${COMPONENTS.photoProfil.avatarWrapper} ${transition ? "translate-y-50" : "translate-y-0 opacity-100 group-hover:-translate-y-6"}`}>
         <img className="h-40 w-40 object-contain drop-shadow-xl" src={`/images/avatar/${photoProfil}`} alt="Avatar" />
      </div>
      {/* 3. COUCHE AVANT (Cache) */}
      <div className={COMPONENTS.photoProfil.cache}></div>
      <div className={`${COMPONENTS.photoProfil.bottomRim} shadow-[0_30px_0_#c084fc]`}></div>
      <div className={`${COMPONENTS.photoProfil.bottomRim} shadow-[0_12px_0_rgb(147,51,234)]`}></div>
    </div>
  );
};
