import { Injectable } from '@angular/core';
import { Converter, CustomerSearchPage } from '@spartacus/core';

@Injectable()
export class CustomerSeacrhCustomNormalizer
  implements Converter<CustomerSearchPage, CustomerSearchPage> {
  constructor() {}

  convert(
    source: CustomerSearchPage,
    _target?: CustomerSearchPage
  ): CustomerSearchPage {
    console.log('CustomerSeacrhCustomNormalizer WORKS !!!', source, _target);
    return source;
  }
}
