import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Order,
  OrderCancellation,
  OrderManagementConnector,
  RoutingService,
  UserOrderService,
} from '@spartacus/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OrderDetailsService } from './order-details.service';

const mockOrder: Order = {
  code: '1',
  status: 'SHIPPED',
  statusDisplay: 'Shipped',
  deliveryAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: 'Buckingham Street 5',
    line2: '1A',
    phone: '(+11) 111 111 111',
    postalCode: 'MA8902',
    town: 'London',
    country: {
      isocode: 'UK',
    },
  },
  deliveryMode: {
    name: 'Standard order-detail-shipping',
    description: '3-5 days',
  },
  paymentInfo: {
    accountHolderName: 'John Smith',
    cardNumber: '************6206',
    expiryMonth: '12',
    expiryYear: '2026',
    cardType: {
      name: 'Visa',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      line1: 'Buckingham Street 5',
      line2: '1A',
      phone: '(+11) 111 111 111',
      postalCode: 'MA8902',
      town: 'London',
      country: {
        isocode: 'UK',
      },
    },
  },
};

const mockRouterWithoutOrderCode = {
  state: {
    url: '/',
    queryParams: {},
    params: {},
    cmsRequired: false,
  },
};

const mockRouter = {
  state: {
    url: '/',
    queryParams: {},
    params: {
      orderCode: '1',
    },
    cmsRequired: false,
  },
};

const routerSubject = new BehaviorSubject<{ state: object }>(mockRouter);

class MockUserOrderService {
  getOrderDetails(): Observable<Order> {
    return of(mockOrder);
  }
  loadOrderDetails(_orderCode: string): void {}
  clearOrderDetails(): void {}
}

class MockRoutingService {
  getRouterState(): Observable<any> {
    return routerSubject.asObservable();
  }
}

class MockOrderCancellationConnector {
  cancelOrder(order): Observable<OrderCancellation> {
    return of({ userId: 'mockUser', entries: [order] });
  }
}

describe('OrderDetailsService', () => {
  let service: OrderDetailsService;
  let userService;
  let routingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderDetailsService,
        {
          provide: UserOrderService,
          useClass: MockUserOrderService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: OrderManagementConnector,
          useClass: MockOrderCancellationConnector,
        },
      ],
    });

    service = TestBed.get(OrderDetailsService as Type<OrderDetailsService>);
    userService = TestBed.get(UserOrderService as Type<UserOrderService>);
    routingService = TestBed.get(RoutingService as Type<RoutingService>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load order details', () => {
    spyOn(routingService, 'getRouterState');
    spyOn(userService, 'loadOrderDetails');
    spyOn(userService, 'clearOrderDetails');
    spyOn(userService, 'getOrderDetails').and.returnValue(of(mockOrder));
    routerSubject.next(mockRouter);

    let orderDetails;
    service
      .getOrderDetails()
      .subscribe(data => (orderDetails = data))
      .unsubscribe();
    expect(userService.loadOrderDetails).toHaveBeenCalledWith('1');
    expect(userService.getOrderDetails).toHaveBeenCalled();
    expect(orderDetails).toBe(mockOrder);
  });

  it('should clean order details', () => {
    spyOn(routingService, 'getRouterState');
    spyOn(userService, 'loadOrderDetails');
    spyOn(userService, 'clearOrderDetails');
    spyOn(userService, 'getOrderDetails').and.returnValue(of(mockOrder));
    routerSubject.next(mockRouterWithoutOrderCode);

    let orderDetails;
    service
      .getOrderDetails()
      .subscribe(data => (orderDetails = data))
      .unsubscribe();
    expect(userService.clearOrderDetails).toHaveBeenCalled();
    expect(userService.getOrderDetails).toHaveBeenCalled();
    expect(orderDetails).toBe(mockOrder);
  });

  it('should mark order as non cancellable', () => {
    const isOrderCancellable = service.isOrderCancellable(mockOrder);

    expect(isOrderCancellable).toBe(false);
  });

  it('should mark order as cancellable', () => {
    const cancellableOrder: Order = {
      code: '1',
      status: 'IN_PROCESS',
      statusDisplay: 'In process',
    };

    const completedOrder: Order = {
      code: '1',
      status: 'READY',
      statusDisplay: 'In process',
    };

    const isOrderCancellable: boolean = service.isOrderCancellable(
      cancellableOrder
    );

    expect(isOrderCancellable).toBe(true);

    const isOrderCompletedCancellable: boolean = service.isOrderCancellable(
      completedOrder
    );

    expect(isOrderCompletedCancellable).toBe(true);
  });
});
