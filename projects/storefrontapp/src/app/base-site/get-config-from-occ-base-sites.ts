import { isDevMode } from '@angular/core';
import {
  BASE_SITE_CONTEXT_ID,
  CURRENCY_CONTEXT_ID,
  LANGUAGE_CONTEXT_ID,
  Occ,
  SiteContextConfig,
} from '@spartacus/core';
import { convertJavaRegExp } from './convert-java-reg-exp';

/**
 * Converts the OCC base sites to the Spartacus Context Config for:
 * - base sites
 * - languages
 * - currencies
 * - urlParameters
 */
export function getConfigFromOccBaseSites(
  occBaseSites: Occ.BaseSites,
  currentUrl: string
): SiteContextConfig {
  if (!occBaseSites) {
    return {};
  }
  const { baseSites } = occBaseSites;
  const baseSite = baseSites.find(site => isCurrentBaseSite(site, currentUrl));
  if (!baseSite) {
    return {};
  }

  const baseStore = getStore(baseSite);
  if (!baseStore) {
    return {};
  }

  return {
    context: {
      urlParameters: getUrlParameters(baseSite),
      [BASE_SITE_CONTEXT_ID]: [baseSite.uid],
      [LANGUAGE_CONTEXT_ID]: getLanguagesIds(
        baseStore,
        baseSite.defaultLanguage
      ),
      [CURRENCY_CONTEXT_ID]: getCurrenciesIds(baseStore),
    },
  };
}

function isCurrentBaseSite(site: Occ.BaseSite, currentUrl: string): boolean {
  const index = (site.urlPatterns || []).findIndex(javaRegexp => {
    const jsRegexp = convertJavaRegExp(javaRegexp);
    if (jsRegexp) {
      const result = jsRegexp.test(currentUrl);
      return result;
    }
  });

  return index !== -1;
}

/**
 * Moves to the start of the array the first element that satisfies the given predicate.
 *
 * @param array array to modify
 * @param predicate function called on elements
 */
function moveAsFirst(array: any[], predicate: (el: any) => boolean): void {
  const index = array.findIndex(predicate);
  if (index !== -1) {
    const [el] = array.splice(index, 1);
    array.unshift(el);
  }
}

/**
 * Returns the IDs of the site's languages. The default language is the first in the list.
 */
function getLanguagesIds(
  store: Occ.BaseStore,
  defaultLanguage: Occ.Language
): string[] {
  const languages = [...store.languages];

  // default lang can be declared directly for a base site instead of base store:
  const defaultLangId =
    (defaultLanguage && defaultLanguage.isocode) ||
    store.defaultLanguage.isocode;

  moveAsFirst(languages, lang => lang.isocode === defaultLangId);
  return languages.map(lang => lang.isocode);
}

/**
 * Returns the IDs of the site's currencies. The default currency is the first in the list.
 */
function getCurrenciesIds(store: Occ.BaseStore): string[] {
  const currencies = [...store.currencies];
  const defaultCurrId = store.defaultCurrency.isocode;

  moveAsFirst(currencies, curr => curr.isocode === defaultCurrId);
  return currencies.map(curr => curr.isocode);
}

/**
 * Returns the base store of the given base site.
 *
 * Although `stores` property is an array, typically there is only one store. So we return the first store from the list.
 */
function getStore(site: Occ.BaseSite): Occ.BaseStore {
  if (site && site.stores && site.stores.length) {
    return site.stores[0];
  }
  if (isDevMode()) {
    console.error(`No base stores for the base site '${site.uid}'`);
  }
}

/**
 * Returns and array of url parameters with site context.
 *
 * NOTE: it maps the string "storefront" (used in OCC) to the "baseSite" (used in Spartacus)
 */
function getUrlParameters(site: Occ.BaseSite): string[] {
  const STOREFRONT_PARAM = 'storefront';

  return (site.urlEncodingAttributes || []).map(param =>
    param === STOREFRONT_PARAM ? BASE_SITE_CONTEXT_ID : param
  );
}
