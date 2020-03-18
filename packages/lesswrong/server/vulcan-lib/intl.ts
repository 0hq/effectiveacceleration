// see https://github.com/apollographql/graphql-tools/blob/master/docs/source/schema-directives.md#marking-strings-for-internationalization

import { getSetting } from '../../lib/vulcan-lib/settings';
import { debug } from '../../lib/vulcan-lib/debug';

/*

Take a header object, and figure out the locale

Also accepts userLocale to indicate the current user's preferred locale

*/
export const getHeaderLocale = (headers, userLocale) => {
  let cookieLocale, acceptedLocale, locale, localeMethod;

  // get locale from cookies
  if (headers['cookie']) {
    const cookies: any = {};
    headers['cookie'].split('; ').forEach(c => {
      const cookieArray = c.split('=');
      cookies[cookieArray[0]] = cookieArray[1];
    });
    cookieLocale = cookies.locale;
  }

  // get locale from accepted-language header
  if (headers['accept-language']) {
    const acceptedLanguages = headers['accept-language'].split(',').map(l => l.split(';')[0]);
    acceptedLocale = acceptedLanguages[0]; // for now only use the highest-priority accepted language
  }

  if (headers.locale) {
    locale = headers.locale;
    localeMethod = 'header';
  } else if (cookieLocale) {
    locale = cookieLocale;
    localeMethod = 'cookie';
  } else if (userLocale) {
    locale = userLocale;
    localeMethod = 'user';
  } else if (acceptedLocale) {
    locale = acceptedLocale;
    localeMethod = 'browser';
  } else {
    locale = getSetting('locale', 'en-US');
    localeMethod = 'setting';
  }

  debug(`// locale: ${locale} (via ${localeMethod})`);

  return locale;
};
