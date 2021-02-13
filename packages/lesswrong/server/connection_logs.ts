import { LWEvents } from '../lib/collections/lwevents/collection';
import { createMutator } from './vulcan-lib';
import { onServerConnect } from '../server/meteorServerSideFns';

onServerConnect(async (connection) => {
  const ip = (connection.httpHeaders && connection.httpHeaders["x-real-ip"]) || connection.clientAddress;
  
  void createMutator({
    collection: LWEvents,
    document: {
      name: 'newConnection',
      important: false,
      properties: {
        ip: ip,
        id: connection.id,
      }
    },
    currentUser: null,
    validate: false,
  })
  //eslint-disable-next-line no-console
  console.info(`new Meteor connection from ${connection.clientAddress}`);

  connection.onClose(() => {
    //eslint-disable-next-line no-console
    console.info(`closed Meteor connection from ${connection.clientAddress}`);
    void createMutator({
      collection: LWEvents,
      document: {
        name: 'closeConnection',
        important: false,
        properties: {
          ip: ip,
          id: connection.id,
        }
      },
      currentUser: null,
      validate: false,
    })
  })
})
