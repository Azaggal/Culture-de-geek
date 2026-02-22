
import React, { useState, useEffect, useRef } from 'react';

export const OtpInput = ({ length = 6, onComplete, theme, pseudoExist, cantJoin }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cantJoin) {
      setOtp(new Array(length).fill("")); // Vide les cases
      setTimeout(() => {
        inputsRef.current[0]?.focus();  
      }, 1001);
    }
  }, [cantJoin, length]);

  const handleChange = (element, index) => {
    const value = element.value.toUpperCase();
    if (isNaN(value) && value !== "" && !/[a-zA-Z]/.test(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newOtp.every(v => v !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
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
            className={`w-full h-12 text-center ${!pseudoExist ? "cursor-not-allowed" : ""}  ${cantJoin ? theme.text.code.wrong : theme.text.code.normal}  `}
          />
        </div>
      ))}
    </div>
  );
};
