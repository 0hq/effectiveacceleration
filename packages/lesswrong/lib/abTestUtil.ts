import React, { useContext } from 'react';
import seedrandom from './seedrandom'
import { useCookies } from 'react-cookie'
import { useCurrentUser } from '../components/common/withUser';
import * as _ from 'underscore';

export const ABTestGroupsContext = React.createContext<Record<string,string>>({});

//
// A/B tests. Each A/B test has a name (which should be unique across all A/B
// tests across all time), a set of groups (identified by strings), and a
// weighting for each group (representing the probability that a given user is
// in that group). A given user (or logged-out client) is in exactly one of the
// groups.
//
// You can see what A/B test groups you're in by going to
//   /users/<user-slug>/abtests
//
// Logged-out users are assigned an A/B test group based on their ClientID. If
// they create a new account, that account inherits the test groups of the
// ClientID through which the account was created. Users created before A/B
// tests were created have their test groups instead assigned based on a hash
// of their username. On pageload, which group a user is in is fixed for that
// tab; logging out and logging in as a different user doesn't switch them to
// that user's A/B test group until they refresh or open a new tab.
//
// A/B tests can be overridden server-wide, eg to end an A/B test and put
// everyone in the winning group, by writing an abTestOverride value into the
// databaseMetadata collection. A/B tests can be overridden for an individual
// user by settings the abTestOverrides field on the user object. The override
// will only apply while they are logged in.
//

type ABTestGroup = {
  description: string,
  weight: number,
}

export class ABTest {
  name: string;
  description: string;
  groups: Record<string,ABTestGroup>;
  
  constructor({name, description, groups}: {
    name: string,
    description: string,
    groups: Record<string,ABTestGroup>
  }) {
    this.name = name;
    this.description = description;
    this.groups = groups;
    registerABTest(this);
  }
}


let allABTests: Record<string,ABTest> = {};

function registerABTest(abtest: ABTest): void {
  if (abtest.name in allABTests)
    throw new Error(`Two A/B tests with the same name: ${abtest.name}`);
  allABTests[abtest.name] = abtest;
}

export function getABTestsMetadata(): Record<string,ABTest> {
  return allABTests;
}

export function getUserABTestKey(user: UsersCurrent|DbUser|null, clientId: string): string {
  if (user?.abTestKey) {
    return user.abTestKey;
  } else {
    return clientId;
  }
}

function getUserABTestGroup(user: UsersCurrent|DbUser|null, clientId: string, abTest: ABTest): string {
  const abTestKey = getUserABTestKey(user, clientId);
  let groupWeights = {};
  for (let group in abTest.groups)
    groupWeights[group] = abTest.groups[group].weight;
  
  if (user && user.abTestOverrides && user.abTestOverrides && user.abTestOverrides[abTest.name]) {
    return user.abTestOverrides[abTest.name];
  } else {
    return weightedRandomPick(groupWeights, `${abTest.name}-${abTestKey}`);
  }
}

export function getAllUserABTestGroups(user: UsersCurrent|DbUser|null, clientId: string): Record<string,string> {
  let abTestGroups: Record<string,string> = {};
  for (let abTestName in allABTests)
    abTestGroups[abTestName] = getUserABTestGroup(user, clientId, allABTests[abTestName]);
  return abTestGroups;

}

// Given a weighted set of strings and a seed, return a random element of that set.
function weightedRandomPick(options: Record<string,number>, seed: string): string {
  const weights = _.values(options);
  if (weights.length === 0)
    throw new Error("Random pick from empty set");
  const totalWeight: number = _.reduce(weights, (x:number, y:number) => x+y);
  const randomRangeValue = totalWeight*seedrandom(seed).double();
  
  let i=0;
  for (const key in options) {
    i += options[key];
    if (i >= randomRangeValue)
      return key;
  }
  throw new Error("Out of range value in weightedRandomPick");
}

export function useABTest(abtest: ABTest): string {
  const currentUser = useCurrentUser();
  const [cookies] = useCookies(['clientId']);
  const clientId = cookies.clientId;
  const abTestGroups: Record<string,string> = useContext(ABTestGroupsContext);
  const group = getUserABTestGroup(currentUser, clientId, abtest);
  
  abTestGroups[abtest.name] = group;
  return group;
}

export function useClientId(): string {
  const [cookies] = useCookies(['clientId']);
  return cookies.clientId;
}

export function useAllABTests(): Record<string,string> {
  const currentUser = useCurrentUser();
  const clientId = useClientId();
  
  const abTestGroups: Record<string,string> = useContext(ABTestGroupsContext);
  
  const testGroups = getAllUserABTestGroups(currentUser, clientId);
  for (let abTestKey in testGroups)
    abTestGroups[abTestKey] = testGroups[abTestKey];
  
  return testGroups;
}
