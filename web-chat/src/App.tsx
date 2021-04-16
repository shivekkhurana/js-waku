import React from 'react';
import './App.css';
import Room from './Room';
import Waku from 'waku/waku';
import {RelayDefaultTopic} from 'waku/waku_relay';
import {WakuMessage} from 'waku/waku_message';
import {ChatMessage} from 'waku-chat/chat_message';

interface Props {
}

interface State {
  messages: string[]
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      messages: []
    };

    this.setupWaku().then(() => console.log('Waku is Ready'));
  }

  async setupWaku() {
    try {
      const waku = await Waku.create({});
      console.log("My peer id: ", waku.libp2p.peerId.toB58String());

      waku.libp2p.pubsub.on(RelayDefaultTopic, (event) => {
        const wakuMsg = WakuMessage.decode(event.data);
        if (wakuMsg.payload) {
          const chatMsg = ChatMessage.decode(wakuMsg.payload);
          const message = renderMessage(chatMsg);

          const messages = this.state.messages.slice();
          messages.push(message);
          this.setState({ messages });
        }
      });
      await waku.relay.subscribe();
    }
    catch (e) {
      console.log("Error encountered during Waku setup: ", e)
    }
  }

  render() {
    return (
      <div className='App'>
        <div className='chat-room'>
          <Room lines={this.state.messages} />
        </div>
      </div>
    );
  }
}

export default App;

// TODO: Own component
function renderMessage(chatMsg: ChatMessage) {
  const timestamp = chatMsg.timestamp.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  });
  return `<${timestamp}> ${chatMsg.nick}: ${chatMsg.message}`;
}
