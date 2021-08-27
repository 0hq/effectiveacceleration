import { Profile } from "passport-auth0";
import Users from "../../lib/vulcan-users";
import { slugify, Utils } from "../../lib/vulcan-lib/utils";
import { updateMutator } from "../vulcan-lib/mutators";

export async function userFromAuth0Profile(profile: Profile): Promise<Partial<DbUser>> {
  const email = profile.emails?.[0].value
  const displayNameMatchesEmail = email === profile.displayName
  const displayName = displayNameMatchesEmail ?
    `new_user_${Math.floor(Math.random() * 10e9)}` :
    profile.displayName
  return {
    email,
    emails: email ?
      [{
        address: email,
        verified: !!profile._json.email_verified
      }] :
      undefined,
    services: {
      auth0: profile
    },
    username: await Utils.getUnusedSlugByCollectionName("Users", slugify(displayName)),
    displayName: displayName,
    usernameUnset: true
  }
}
