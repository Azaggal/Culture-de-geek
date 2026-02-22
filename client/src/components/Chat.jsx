
import React, { useState, useEffect, useRef } from 'react';
import { COMPONENTS } from '../theme';

export const Chat = ({ onClick, historiqueChat, theme }) => {
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
    <div className={`${COMPONENTS.chat.container} ${open ? "-translate-y-20" : "translate-y-full"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={COMPONENTS.chat.button}
      >
        {open ? "▼ Fermer" : "▲ Chat"}
      </button>

      <div className='h-max p-9'>
        <div className={COMPONENTS.chat.history} >
          {historiqueChat.map ((chat, index) => (
            <p key={index}>{chat}</p>
          ))}
          <div ref={finChatRef} />
        </div>

        <div className='flex flex-row'>
          <input
            type="text" placeholder='Écris ici...' value={texteChat} 
            onChange={(e) => changerTexteChat(e.target.value)} 
            className={`${COMPONENTS.chat.input} ${texteChat === "" ? "" : "shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]" }`}
          />
          <button onClick={() => {onClick(texteChat); changerTexteChat(""); }} className={COMPONENTS.chat.sendBtn}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};
