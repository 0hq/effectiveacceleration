import SimpleSchema from 'simpl-schema';
import { getSetting } from './settings';
import { debug } from './debug';

export const Strings = {};

export const addStrings = (language, strings) => {
  if (typeof Strings[language] === 'undefined') {
    Strings[language] = {};
  }
  Strings[language] = {
    ...Strings[language],
    ...strings
  };
};

function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
}

export const getString = ({id, values, defaultMessage, locale}) => {
  const messages = Strings[locale] || {};
  let message = messages[id];

  // use default locale
  if(!message) {
    debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}".\x1b[0m`);
    message = Strings[defaultLocale] && Strings[defaultLocale][id];

    // if default locale hasn't got the message too
    if(!message && locale !== defaultLocale)
      debug(`\x1b[32m>> INTL: No string found for id "${id}" in the default locale ("${defaultLocale}").\x1b[0m`);
  }

  if (message && values) {
    Object.keys(values).forEach(key => {
      message = replaceAll(message, `{${key}}`, values[key]);
    });
  }
  return message;
};

export const defaultLocale = getSetting('locale', 'en');

/*

Generate custom IntlString SimpleSchema type

*/
export const getIntlString = () => {
  const schema = {
    locale: {
      type: String,
      optional: true
    },
    value: {
      type: String,
      optional: true
    }
  };

  const IntlString = new SimpleSchema(schema);
  IntlString.name = 'IntlString';
  return IntlString;
};
