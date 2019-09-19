import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ProtectedRoutesGuard } from './protected-routes.guard';
import { ProtectedRoutesService } from './protected-routes.service';

class MockAuthGuard {
  canActivate = jasmine
    .createSpy('AuthGuard.canActivate')
    .and.returnValue(of('authGuard-result'));
}

class MockProtectedRoutesService {
  isUrlProtected() {}
}

describe('ProtectedRoutesGuard', () => {
  let guard: ProtectedRoutesGuard;
  let service: ProtectedRoutesService;
  let authGuard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProtectedRoutesGuard,
        {
          provide: ProtectedRoutesService,
          useClass: MockProtectedRoutesService,
        },
        {
          provide: AuthGuard,
          useClass: MockAuthGuard,
        },
      ],
    });

    guard = TestBed.get(ProtectedRoutesGuard as Type<ProtectedRoutesGuard>);
    service = TestBed.get(ProtectedRoutesService as Type<
      ProtectedRoutesService
    >);
    authGuard = TestBed.get(AuthGuard as Type<AuthGuard>);
  });

  describe('canActivate', () => {
    describe('when anticipated url is NOT protected', () => {
      beforeEach(() => {
        console.log(guard, service, authGuard);
        spyOn(service, 'isUrlProtected').and.returnValue(false);
      });

      it('should return true', () => {
        let result;
        guard
          .canActivate({ url: [] } as ActivatedRouteSnapshot)
          .subscribe(res => (result = res));
        expect(result).toBe(true);
      });
    });

    describe('when anticipated url is protected', () => {
      beforeEach(() => {
        console.log(guard, service, authGuard);
        spyOn(service, 'isUrlProtected').and.returnValue(true);
      });

      it('should return result of AuthGuard.canActivate', () => {
        let result;
        guard
          .canActivate({ url: [] } as ActivatedRouteSnapshot)
          .subscribe(res => (result = res))
          .unsubscribe();
        expect(result).toBe('authGuard-result');
      });

      it('should call service.isUrlProtected with segments of anticipated url', () => {
        guard
          .canActivate({
            url: [{ path: 'hello' }, { path: 'world' }],
          } as ActivatedRouteSnapshot)
          .subscribe()
          .unsubscribe();
        expect(service.isUrlProtected).toHaveBeenCalledWith(['hello', 'world']);
      });

      it('should call service.isUrlProtected with array of empty string when the anticipated url is the root path', () => {
        guard
          .canActivate({ url: [] } as ActivatedRouteSnapshot)
          .subscribe()
          .unsubscribe();
        expect(service.isUrlProtected).toHaveBeenCalledWith(['']);
      });
    });
  });
});
