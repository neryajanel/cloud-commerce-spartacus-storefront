// import {
//   OCC_BASE_URL_META_TAG_NAME,
//   OCC_BASE_URL_META_TAG_PLACEHOLDER,
// } from '../../../core/src/occ/config/config-from-meta-tag-factory';

import {
  OCC_BASE_URL_META_TAG_NAME,
  OCC_BASE_URL_META_TAG_PLACEHOLDER,
} from '@spartacus/core';

/**
 * Gets the OCC base url from the meta tag of the DOM
 */
export function getOccBaseUrlFromMetaTag() {
  const meta = document.querySelector(
    `meta[name="${OCC_BASE_URL_META_TAG_NAME}"]`
  );
  const baseUrl = meta && meta.getAttribute('content');
  return baseUrl === OCC_BASE_URL_META_TAG_PLACEHOLDER ? null : baseUrl;
}

/**
 * Gets the OCC base url from the meta tag of the given raw HTML string
 *
 * @param rawHtml this param should be used in SSR where there is no access to the `document` object
 */
export function getOccBaseUrlFromMetaTagSSR(rawHtml: string) {
  const occBaseUrlMetaTagRegExp = /<meta\s+name\s*=\s*\"occ-backend-base-url\"\s+content\s*=\s*\"(.*)\"\s*\/?>/;
  const match = rawHtml.match(occBaseUrlMetaTagRegExp);
  const baseUrl = match && match[1];
  return baseUrl === OCC_BASE_URL_META_TAG_PLACEHOLDER ? null : baseUrl;
}