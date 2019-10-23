import { Occ } from '../occ/occ-models';
import {
  BASE_SITE_CONTEXT_ID,
  CURRENCY_CONTEXT_ID,
  LANGUAGE_CONTEXT_ID,
} from '../site-context';
import { ExternalConfig } from './external-config';
import { ExternalConfigConverter } from './external-config-converter';
import { JavaRegExpConverter } from './java-reg-exp-converter';

describe(`ExternalConfigConverter`, () => {
  describe(`fromOccBaseSites`, () => {
    let mockBaseSite: Occ.BaseSite;
    let mockBaseStore: Occ.BaseStore;

    beforeEach(() => {
      mockBaseStore = {
        languages: [],
        currencies: [],
        defaultLanguage: {},
        defaultCurrency: {},
      };

      mockBaseSite = {
        uid: 'test',
        urlPatterns: ['testUrl'],
        stores: [mockBaseStore],
        urlEncodingAttributes: [],
      };

      spyOn(JavaRegExpConverter, 'convert').and.callFake(x => new RegExp(x));
    });

    it(`should throw error when the base sites param is undefined`, () => {
      const baseSites: Occ.BaseSites = undefined;
      const currentUrl = 'testUrl';
      expect(() =>
        ExternalConfigConverter.fromOccBaseSites(baseSites, currentUrl)
      ).toThrowError();
    });

    it(`should throw error when baseSites property param is undefined`, () => {
      const baseSites: Occ.BaseSites = { baseSites: undefined };
      const currentUrl = 'testUrl';
      expect(() =>
        ExternalConfigConverter.fromOccBaseSites(baseSites, currentUrl)
      ).toThrowError();
    });

    it(`should throw error when baseSites property is an empty array`, () => {
      const baseSites: Occ.BaseSites = { baseSites: [] };
      const currentUrl = 'testUrl';
      expect(() =>
        ExternalConfigConverter.fromOccBaseSites(baseSites, currentUrl)
      ).toThrowError();
    });

    it(`should throw error when no url pattern of any base site matches the current url`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          { uid: 'test1', urlPatterns: ['testUrl1'], stores: [{}] },
          { uid: 'test2', urlPatterns: ['testUrl2'], stores: [{}] },
        ],
      };
      const currentUrl = 'testUrl';
      expect(() =>
        ExternalConfigConverter.fromOccBaseSites(baseSites, currentUrl)
      ).toThrowError();
    });

    it(`should throw error when matched base site doesn't have at least one store`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [{ uid: 'test', urlPatterns: ['testUrl'], stores: [] }],
      };
      const currentUrl = 'testUrl';
      expect(() =>
        ExternalConfigConverter.fromOccBaseSites(baseSites, currentUrl)
      ).toThrowError();
    });

    it(`should convert the first base site config that matches one of its url patterns with the current url`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            uid: 'test1',
            urlPatterns: ['^testUrl1$', '^testUrl11$'],
          },
          {
            ...mockBaseSite,
            uid: 'test2',
            urlPatterns: ['^testUrl2$', '^testUrl22$'],
          },
          {
            ...mockBaseSite,
            uid: 'test3',
            urlPatterns: ['^testUrl2$'],
          },
        ],
      };
      const currentUrl = 'testUrl2';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(JavaRegExpConverter.convert).toHaveBeenCalledTimes(3);
      expect(JavaRegExpConverter.convert).not.toHaveBeenCalledWith(
        '^testUrl22$'
      );
      expect(res.baseSite).toEqual('test2');
    });

    it(`should convert attributes of the matched base site`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            uid: 'test',
            urlPatterns: ['testUrl'],
            stores: [
              {
                languages: [{ isocode: 'de' }, { isocode: 'en' }],
                defaultLanguage: { isocode: 'en' },
                currencies: [{ isocode: 'EUR' }, { isocode: 'USD' }],
                defaultCurrency: { isocode: 'EUR' },
              },
            ],
            urlEncodingAttributes: ['language', 'currency'],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res).toEqual({
        baseSite: 'test',
        languages: ['en', 'de'],
        currencies: ['EUR', 'USD'],
        urlParameters: ['language', 'currency'],
      });
    });

    it(`should convert the base site config using it's first base store`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            stores: [
              {
                ...mockBaseStore,
                currencies: [{ isocode: 'USD' }],
                defaultCurrency: { isocode: 'USD' },
              },
              {
                ...mockBaseStore,
                currencies: [{ isocode: 'EUR' }],
                defaultCurrency: { isocode: 'EUR' },
              },
            ],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res.currencies).toEqual(['USD']);
    });

    it(`should convert the base site config using the default language of base site over the default language of base store`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            defaultLanguage: { isocode: 'pl' },
            stores: [
              {
                ...mockBaseStore,
                languages: [{ isocode: 'en' }, { isocode: 'pl' }],
                defaultLanguage: { isocode: 'en' },
              },
            ],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res.languages).toEqual(['pl', 'en']);
    });

    it(`should convert languages and put the default language as the first one`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            stores: [
              {
                ...mockBaseStore,
                languages: [
                  { isocode: 'en' },
                  { isocode: 'pl' },
                  { isocode: 'de' },
                ],
                defaultLanguage: { isocode: 'pl' },
              },
            ],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res.languages[0]).toEqual('pl');
    });

    it(`should convert currencies and put the default language as the first one`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            stores: [
              {
                ...mockBaseStore,
                currencies: [
                  { isocode: 'USD' },
                  { isocode: 'PLN' },
                  { isocode: 'EUR' },
                ],
                defaultCurrency: { isocode: 'PLN' },
              },
            ],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res.currencies[0]).toEqual('PLN');
    });

    it(`should convert url encoding attributes and map "storefront" to "baseSite"`, () => {
      const baseSites: Occ.BaseSites = {
        baseSites: [
          {
            ...mockBaseSite,
            urlEncodingAttributes: ['storefront', 'language', 'currency'],
          },
        ],
      };
      const currentUrl = 'testUrl';
      const res = ExternalConfigConverter.fromOccBaseSites(
        baseSites,
        currentUrl
      );
      expect(res.urlParameters).toEqual(['baseSite', 'language', 'currency']);
    });
  });

  describe(`toSiteContextConfig`, () => {
    let mockExternalConfig: ExternalConfig;

    beforeEach(() => {
      mockExternalConfig = {
        baseSite: 'test',
        languages: ['de', 'en', 'pl'],
        currencies: ['EUR', 'USD', 'PLN'],
        urlParameters: ['baseSite', 'language', 'currency'],
      };
    });

    it(`should convert base site uid`, () => {
      const res = ExternalConfigConverter.toSiteContextConfig(
        mockExternalConfig
      );
      expect(res.context[BASE_SITE_CONTEXT_ID]).toEqual(['test']);
    });

    it(`should convert languages`, () => {
      const res = ExternalConfigConverter.toSiteContextConfig(
        mockExternalConfig
      );
      expect(res.context[LANGUAGE_CONTEXT_ID]).toEqual(['de', 'en', 'pl']);
    });

    it(`should convert currencies`, () => {
      const res = ExternalConfigConverter.toSiteContextConfig(
        mockExternalConfig
      );
      expect(res.context[CURRENCY_CONTEXT_ID]).toEqual(['EUR', 'USD', 'PLN']);
    });
  });

  describe(`to18nConfig`, () => {
    let mockExternalConfig: ExternalConfig;

    beforeEach(() => {
      mockExternalConfig = {
        languages: ['en', 'de', 'pl'],
      };
    });

    it(`should convert the fallback lang`, () => {
      const res = ExternalConfigConverter.toI18nConfig(mockExternalConfig);
      expect(res.i18n.fallbackLang).toEqual('en');
    });
  });
});
