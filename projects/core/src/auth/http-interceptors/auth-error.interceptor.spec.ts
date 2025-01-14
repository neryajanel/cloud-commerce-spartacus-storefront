import {
  HttpClient,
  HttpHandler,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  USE_CLIENT_TOKEN,
  USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
} from '../../occ/utils/interceptor-util';
import { AuthService } from '../facade/auth.service';
import { ClientErrorHandlingService } from '../services/client-error/client-error-handling.service';
import { CustomerSupportAgentErrorHandlingService } from '../services/csagent-error/csagent-error-handling.service';
import { UserErrorHandlingService } from '../services/user-error/user-error-handling.service';
import { AuthErrorInterceptor } from './auth-error.interceptor';

class MockUserErrorHandlingService {
  handleExpiredUserToken(
    _request: HttpRequest<any>,
    _next: HttpHandler
  ): Observable<any> {
    return;
  }
  handleExpiredRefreshToken() {}
}

class MockClientErrorHandlingService {
  handleExpiredClientToken(
    _request: HttpRequest<any>,
    _next: HttpHandler
  ): Observable<any> {
    return;
  }
}

class MockAuthService {
  logout(): void {}
}

class MockCustomerSupportAgentErrorHandlingService {
  terminateCustomerSupportAgentExpiredSession(): void {}
}

describe('AuthErrorInterceptor', () => {
  let userErrorHandlingService: UserErrorHandlingService;
  let clientErrorHandlingService: ClientErrorHandlingService;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let csagentErrorHandlingService: CustomerSupportAgentErrorHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: UserErrorHandlingService,
          useClass: MockUserErrorHandlingService,
        },
        {
          provide: ClientErrorHandlingService,
          useClass: MockClientErrorHandlingService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: CustomerSupportAgentErrorHandlingService,
          useClass: MockCustomerSupportAgentErrorHandlingService,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthErrorInterceptor,
          multi: true,
        },
      ],
    });

    userErrorHandlingService = TestBed.get(UserErrorHandlingService as Type<
      UserErrorHandlingService
    >);
    clientErrorHandlingService = TestBed.get(ClientErrorHandlingService as Type<
      ClientErrorHandlingService
    >);
    authService = TestBed.get(AuthService as Type<AuthService>);
    httpMock = TestBed.get(HttpTestingController as Type<
      HttpTestingController
    >);
    csagentErrorHandlingService = TestBed.get(
      CustomerSupportAgentErrorHandlingService
    );
    spyOn(userErrorHandlingService, 'handleExpiredUserToken').and.returnValue(
      of({} as any)
    );
    spyOn(userErrorHandlingService, 'handleExpiredRefreshToken').and.stub();
    spyOn(
      clientErrorHandlingService,
      'handleExpiredClientToken'
    ).and.returnValue(of({}));
    spyOn(
      csagentErrorHandlingService,
      'terminateCustomerSupportAgentExpiredSession'
    ).and.stub();
  });

  it(`should catch 401 error for a client token`, inject(
    [HttpClient],
    (http: HttpClient) => {
      const headers = new HttpHeaders().set(USE_CLIENT_TOKEN, 'true');
      const options = {
        headers,
      };
      http.get('/test', options).subscribe(result => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne(req => {
        return req.method === 'GET';
      });
      mockReq.flush(
        {
          errors: [
            {
              type: 'InvalidTokenError',
              message: 'Invalid access token: some token',
            },
          ],
        },
        { status: 401, statusText: 'Error' }
      );
      expect(
        clientErrorHandlingService.handleExpiredClientToken
      ).toHaveBeenCalled();
    }
  ));

  it(`should catch 401 error for a user token`, inject(
    [HttpClient],
    (http: HttpClient) => {
      http.get('/test').subscribe(result => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne(req => {
        return req.method === 'GET';
      });

      mockReq.flush(
        {
          errors: [
            {
              type: 'InvalidTokenError',
              message: 'Invalid access token: some token',
            },
          ],
        },
        { status: 401, statusText: 'Error' }
      );
      expect(
        userErrorHandlingService.handleExpiredUserToken
      ).toHaveBeenCalled();
    }
  ));

  it(`should catch refresh_token 401 error`, inject(
    [HttpClient],
    (http: HttpClient) => {
      http.get('/authorizationserver/oauth/token').subscribe(result => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne(req => {
        return req.method === 'GET';
      });

      mockReq.flush(
        {
          error: 'invalid_token',
          error_description: 'Invalid refresh token (expired): 1234567890',
        },
        { status: 401, statusText: 'Error' }
      );
      expect(
        userErrorHandlingService.handleExpiredRefreshToken
      ).toHaveBeenCalled();
    }
  ));

  it(`should catch 400 error`, inject([HttpClient], (http: HttpClient) => {
    const url = '/authorizationserver/oauth/token';
    const params = new HttpParams()
      .set('refresh_token', 'some_token')
      .set('grant_type', 'refresh_token'); // authorization_code, client_credentials, password
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    spyOn(authService, 'logout').and.stub();

    http
      .post(url, params, { headers })
      .pipe(catchError((error: any) => throwError(error)))
      .subscribe(
        _result => {},
        _error => {
          expect(authService.logout).toHaveBeenCalled();
        }
      );

    const mockReq: TestRequest = httpMock.expectOne(req => {
      return req.method === 'POST' && req.url === url;
    });

    mockReq.flush(
      { error: 'invalid_grant' },
      { status: 400, statusText: 'Error' }
    );
  }));

  it(`should catch 401 error for a csagent request`, inject(
    [HttpClient],
    (http: HttpClient) => {
      const headers = new HttpHeaders().set(
        USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
        'true'
      );
      const options = {
        headers,
      };
      http.get('/test', options).subscribe(result => {
        expect(result).toBeTruthy();
      });

      const mockReq: TestRequest = httpMock.expectOne(req => {
        return req.method === 'GET';
      });
      mockReq.flush(
        {
          errors: [
            {
              type: 'InvalidTokenError',
              message: 'Invalid access token: some token',
            },
          ],
        },
        { status: 401, statusText: 'Error' }
      );
      expect(
        csagentErrorHandlingService.terminateCustomerSupportAgentExpiredSession
      ).toHaveBeenCalled();
    }
  ));
});
