import React from 'react';
import { Message } from '../types';
import Icon from './Icon';

interface ChatMessageProps {
  message: Message;
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#c36e26] flex items-center justify-center flex-shrink-0">
        <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="w-5 h-5 text-white" />
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#333e48] flex items-center justify-center flex-shrink-0">
        <Icon path="M19.5 12.5c0 .38-.03.75-.08 1.12L22 15.5l-2 3.46-2.5-1.5c-.32.25-.67.47-1.04.65l-.5 2.89h-4l-.5-2.89c-.37-.18-.72-.4-1.04-.65l-2.5 1.5-2-3.46 2.58-1.88c-.05-.37-.08-.74-.08-1.12s.03-.75.08-1.12L2 9.5l2-3.46 2.5 1.5c.32-.25.67-.47 1.04-.65l.5-2.89h4l.5 2.89c.37.18.72.4 1.04.65l2.5-1.5 2 3.46-2.58 1.88c.05.37.08.74.08 1.12zM12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" className="w-5 h-5 text-[#e2a32d]"/>
    </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <ModelIcon />}
      <div className={`p-4 rounded-lg max-w-xl ${isUser ? 'bg-[#c36e26] text-white rounded-br-none' : 'bg-[#333e48] text-gray-200 rounded-bl-none'}`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
       {isUser && <UserIcon />}
    </div>
  );
};

export default ChatMessage;