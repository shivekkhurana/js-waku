// Ensure that this class matches the proto interface while
import { Reader } from 'protobufjs/minimal';

// Protecting the user from protobuf oddities
import { WakuMessageProto } from '../proto/waku/v2/message';

export const DEFAULT_CONTENT_TOPIC = '/waku/2/default-content/proto';
const DEFAULT_VERSION = 0;

export class WakuMessage {
  // TODO: Adopt similar design to HistoryRPC
  private constructor(
    public payload?: Uint8Array,
    public contentTopic?: string,
    public version?: number
  ) {}

  static fromProto(proto: WakuMessageProto) {
    return new WakuMessage(proto.payload, proto.contentTopic, proto.version);
  }

  /**
   * Create Message with a utf-8 string as payload
   * @param payload
   * @returns {WakuMessage}
   */
  static fromUtf8String(payload: string): WakuMessage {
    const buf = Buffer.from(payload, 'utf-8');
    return new WakuMessage(buf, DEFAULT_CONTENT_TOPIC, DEFAULT_VERSION);
  }

  /**
   * Create Message with a byte array as payload
   * @param payload
   * @param contentTopic
   * @returns {WakuMessage}
   */
  static fromBytes(
    payload: Uint8Array,
    contentTopic: string = DEFAULT_CONTENT_TOPIC
  ): WakuMessage {
    return new WakuMessage(payload, contentTopic, DEFAULT_VERSION);
  }

  static decode(bytes: Uint8Array): WakuMessage {
    const wakuMsg = WakuMessageProto.decode(Reader.create(bytes));
    return new WakuMessage(
      wakuMsg.payload,
      wakuMsg.contentTopic,
      wakuMsg.version
    );
  }

  toBinary(): Uint8Array {
    return WakuMessageProto.encode({
      payload: this.payload,
      version: this.version,
      contentTopic: this.contentTopic,
    }).finish();
  }

  utf8Payload(): string {
    if (!this.payload) {
      return '';
    }

    return Array.from(this.payload)
      .map((char) => {
        return String.fromCharCode(char);
      })
      .join('');
  }

  // Purely for tests purposes.
  // We do consider protobuf field when checking equality
  // As the content is held by the other fields.
  isEqualTo(other: WakuMessage) {
    const payloadsAreEqual =
      this.payload && other.payload
        ? Buffer.compare(this.payload, other.payload) === 0
        : !(this.payload || other.payload);
    return (
      payloadsAreEqual &&
      this.contentTopic === other.contentTopic &&
      this.version === other.version
    );
  }
}
