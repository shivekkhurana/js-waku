import test from 'ava';
import Pubsub from 'libp2p-interfaces/src/pubsub';

import { delay } from '../test_utils/delay';
import { NimWaku } from '../test_utils/nim_waku';

import { createNode } from './node';
import { Message } from './waku_message';
import { CODEC, TOPIC, WakuRelay } from './waku_relay';

test('Can publish message', async (t) => {
  const message = Message.fromString('Bird bird bird, bird is the word!');

  const [node1, node2] = await Promise.all([createNode(), createNode()]);
  const wakuRelayNode1 = new WakuRelay(node1.pubsub);
  const wakuRelayNode2 = new WakuRelay(node2.pubsub);

  // Add node's 2 data to the PeerStore
  node1.peerStore.addressBook.set(node2.peerId, node2.multiaddrs);
  await node1.dial(node2.peerId);

  await wakuRelayNode1.subscribe();
  await wakuRelayNode2.subscribe();

  // Setup the promise before publishing to ensure the event is not missed
  // TODO: Is it possible to import `Message` type?
  const promise = waitForNextData(node1.pubsub);

  await delay(500);

  await wakuRelayNode2.publish(message);

  const node1Received = await promise;

  t.true(node1Received.isEqualTo(message));
});

test('Register waku relay protocol', async (t) => {
  const node = await createNode();

  const protocols = Array.from(node.upgrader.protocols.keys());

  t.truthy(protocols.findIndex((value) => value == CODEC));
});

test('Does not register any sub protocol', async (t) => {
  const node = await createNode();

  const protocols = Array.from(node.upgrader.protocols.keys());
  t.truthy(protocols.findIndex((value) => value.match(/sub/)));
});

test('Nim-waku: connects', async (t) => {
  const nimWaku = new NimWaku();
  await nimWaku.start();

  const node = await createNode();
  console.log(node.peerId.toB58String());

  node.peerStore.addressBook.set(nimWaku.peerId, [nimWaku.multiaddr]);
  await node.dial(nimWaku.peerId);

  const peers = await nimWaku.peers();

  console.log(peers);
  t.is(peers.length, 1);
});

function waitForNextData(pubsub: Pubsub): Promise<Message> {
  return new Promise((resolve) => {
    pubsub.once(TOPIC, resolve);
  }).then((msg: any) => {
    return Message.fromBinary(msg.data);
  });
}