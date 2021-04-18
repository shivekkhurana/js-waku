import multiaddr from 'multiaddr';
import PeerId from 'peer-id';
import React, { useEffect, useState } from 'react';
import './App.css';
import Room from './Room';
import Waku from 'waku/waku';
import { ChatMessage } from 'waku-chat/chat_message';

interface Props {
}

interface State {
  waku?: Waku;
  messages: string[]
}

export default function App() {
  const [state, setState] = useState<State>({ waku: undefined, messages: [] });

  return (
    <div className='App'>
      <div className='chat-room'>
        <Room lines={state.messages} />
      </div>
    </div>
  );
}


