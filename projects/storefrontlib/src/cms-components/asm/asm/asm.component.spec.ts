import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsmRootComponent } from './asm.component';

describe('AsmRootComponent', () => {
  let component: AsmRootComponent;
  let fixture: ComponentFixture<AsmRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsmRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsmRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
