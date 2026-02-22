
import React from 'react';

export const ButtonRepReview = ({reponse, isCorrect, clicked, theme}) => {
  const styleActif = clicked ? theme.button.stateQcm.pressedGame : "";
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
};

export const ButtonRep = ({ reponse, onChoixFait, isClicked, theme }) => {
  const styleActif = isClicked ? theme.button.stateQcm.pressedGame : "";
  return (
    <button
      onClick={() => { onChoixFait(reponse) }}
      className={`${theme.button.gameAnswer} ${styleActif}`}
    >
      {reponse}
    </button>
  );
};

export const BoutonValide = ({changeEtat, theme, etat, isChef}) => {
  return (
      <button disabled={!isChef}
        onClick={() => {changeEtat(!etat)}} 
        className={` ${etat ? theme.button.stateBtnBon.correct : theme.button.stateBtnBon.wrong}`}
      >Bon</button>
  );
};

export const ButtonChoix = ({ valeur, changerChoix, isSelected, isChef, theme }) => {
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
};

export const SuivantReview = ({passerSuivant, theme}) => {
  return (
        <button onClick={() => { passerSuivant() }} className={theme.button.primary}>Réponse Suivante</button>
  );
};

export const ButtonPret = ({ tousPrets, lancerPartieSocket, texte, theme }) => {
  return (
    <button
      disabled={!tousPrets}
      onClick={lancerPartieSocket}
      className={` min-w-35
        ${!tousPrets ? theme.button.disabled : theme.button.primary}
      `} 
    >
      {texte}
    </button>
  );
};
