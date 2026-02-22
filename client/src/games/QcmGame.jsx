
import React from 'react';
import { ButtonRep, ButtonRepReview } from '../components/UI';

export const QcmGame = ({ options, onChoixFait, repOuverte, theme, review, valueText, vraieReponse }) => {
  if (review) {
    return (
      <div className={theme.optionsGrid}>
        {options.map((opt, i) => (
          <ButtonRepReview
            key={i}
            reponse={opt}
            isCorrect={opt === vraieReponse}
            clicked={opt === valueText}
            theme={theme}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={theme.optionsGrid}>
      {options.map((opt, i) => (
        <ButtonRep
          key={i}
          reponse={opt}
          onChoixFait={onChoixFait}
          isClicked={repOuverte === opt}
          theme={theme}
        />
      ))}
    </div>
  );
};
