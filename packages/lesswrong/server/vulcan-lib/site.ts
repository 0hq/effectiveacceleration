import { forumTitleSetting, siteUrlSetting } from '../../lib/instanceSettings';
import { addGraphQLQuery, addGraphQLResolvers, addGraphQLSchema } from '../../lib/vulcan-lib/graphql';
import { Utils } from '../../lib/vulcan-lib/utils';

const siteSchema = `type Site {
  title: String
  url: String
  logoUrl: String
}`;
addGraphQLSchema(siteSchema);

const siteResolvers = {
  Query: {
    SiteData(root, args, context: ResolverContext) {
      return {
        title: forumTitleSetting.get(),
        url: siteUrlSetting.get(),
        logoUrl: Utils.getLogoUrl(),
      };
    },
  },
};

addGraphQLResolvers(siteResolvers);

addGraphQLQuery('SiteData: Site');
