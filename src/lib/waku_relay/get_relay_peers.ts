import Gossipsub from 'libp2p-gossipsub';
import { shuffle } from 'libp2p-gossipsub/src/utils';

import { RelayCodec } from './index';

/**
 * Given a topic, returns up to count peers subscribed to that topic
 * that pass an optional filter function
 *
 * @param {Gossipsub} router
 * @param {String} topic
 * @param {Number} count
 * @param {Function} [filter] a function to filter acceptable peers
 * @returns {Set<string>}
 *
 */
export function getRelayPeers(
  router: Gossipsub,
  topic: string,
  count: number,
  filter: (id: string) => boolean = () => true
): Set<string> {
  const peersInTopic = router.topics.get(topic);
  if (!peersInTopic) {
    return new Set();
  }

  // Adds all peers using our protocol
  // that also pass the filter function
  let peers: string[] = [];
  peersInTopic.forEach((id: string) => {
    const peerStreams = router.peers.get(id);
    if (!peerStreams) {
      return;
    }
    if (peerStreams.protocol == RelayCodec && filter(id)) {
      peers.push(id);
    }
  });

  // Pseudo-randomly shuffles peers
  peers = shuffle(peers);
  if (count > 0 && peers.length > count) {
    peers = peers.slice(0, count);
  }

  return new Set(peers);
}
