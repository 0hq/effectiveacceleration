import { forEachDocumentBatchInCollection, registerMigration } from './migrationUtils';
import Users from 'meteor/vulcan:users';

registerMigration({
  name: "confirmLegacyEmails",
  idempotent: true,
  action: async () => {
    forEachDocumentBatchInCollection({
      collection: Users,
      batchSize: 1000,
      callback: (users) => {
        let updates = [];
        
        for(let user of users)
        {
          // If the user is not a legacy user, no change
          if (!user || !user.legacy || !user.legacyData)
            continue;
          
          // Because all emails were verified on import, if the email address
          // is unverified, that means verification was cleared (eg by an email
          // address change) on import.
          if (_.some(user.emails, email=>!email.verified))
            continue;
          
          // If user.whenConfirmationEmailSent, either the email address was unnecessarily re-verified, or the email
          // was un-verified by changing email address and then re-verified. Or a verification email was sent but not
          // clicked; that case is hard to distinguish. In any case, leave things as-is.
          if (user.whenConfirmationEmailSent)
            continue;
          
          // If the email address matches legacyData.emailAddress, set its verified flag to legacyData.email_validated.
          const legacyData = user.legacyData;
          for (let i=0; i<user.emails.length; i++) {
            if (legacyData && legacyData.email
              && user.emails && user.emails[i].address === legacyData.email)
            {
              const shouldBeVerified = legacyData.email_validated;
              if(user.emails[i].verified != shouldBeVerified) {
                updates.push({
                  updateOne: {
                    filter: {_id: user._id},
                    update: {
                      $set: {
                        [`emails[${i}].verified`]: shouldBeVerified
                      }
                    }
                  }
                });
              }
            }
          }
        }
        
        Users.rawCollection().bulkWrite(updates, { ordered: false });
      }
    });
  },
});
