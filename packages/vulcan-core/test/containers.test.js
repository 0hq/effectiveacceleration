// setup JSDOM server side for testing (necessary for Enzyme to mount)
import 'jsdom-global/register';
import React from 'react';
import expect from 'expect';
import { initComponentTest } from 'meteor/vulcan:test';

// we must import all the other components, so that "registerComponent" is called
import '../lib/modules';
// setup Vulcan (load components, initialize fragments)
initComponentTest();

describe('vulcan-core/containers', function() {
  describe('handleOptions', function() {
    const expectedCollectionName = 'COLLECTION_NAME';
    const collectionNameOptions = { collectionName: expectedCollectionName };
    const expectedCollection = { options: collectionNameOptions };
    it('get collectionName from collection', function() {
      const options = { collection: expectedCollection };
      const { collection, collectionName } = extractCollectionInfo(options);
      expect(collection).toEqual(expectedCollection);
      expect(collectionName).toEqual(expectedCollectionName);
    });
    it('get collection from collectioName', function() {
      // MOCK getCollection
      const { collection, collectionName } = extractCollectionInfo(collectionNameOptions);
      expect(collection).toEqual(expectedCollection);
      expect(collectionName).toEqual(expectedCollectionName);
    });
    const expectedFragmentName = 'FRAGMENT_NAME';
    const expectedFragment = {
      definitions: [{ name: { value: expectedFragmentName } }],
    };
    it('get fragment from fragmentName', function() {
      // MOCK getCollection
      const options = { fragmentName: expectedFragmentName };
      const { fragment, fragmentName } = extractFragmentInfo(options);
      expect(fragment).toEqual(expectedFragment);
      expect(fragmentName).toEqual(expectedFragmentName);
    });
    it('get fragmentName from fragment', function() {
      const options = { fragment: expectedFragment };
      const { fragment, fragmentName } = extractFragmentInfo(options);
      expect(fragment).toEqual(expectedFragment);
      expect(fragmentName).toEqual(expectedFragmentName);
    });
    it('get fragmentName and fragment from collectionName', function() {
      // if options does not contain fragment, we get the collection default fragment based on its name
      const options = {};
      const { fragment, fragmentName } = extractFragmentInfo(options, expectedCollectionName);
      expect(fragment).toEqual(expectedFragment);
      expect(fragmentName).toEqual(expectedFragmentName);
    });
  });

  describe('withMessages', function() {
    const WrappedComponent = props => <div />;
    const apolloClient = null; // TODO: init an apolloClient, that must be available in the context
    it.skip('pass messages', function() {});
    it.skip('add a flash message', function() {});
    it.skip('mark a flash message as seen', function() {});
    it.skip('hide a flash message as seen', function() {});
    it.skip('clear seen', function() {});
  });
});
