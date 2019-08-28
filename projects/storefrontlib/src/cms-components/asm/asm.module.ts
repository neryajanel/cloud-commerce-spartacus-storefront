import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FeaturesConfigModule, I18nModule } from '@spartacus/core';
import { AsmComponent } from './asm-main/asm.component';
import { AsmRootComponent } from './asm-root/asm-root.component';
import { CSAgentLoginFormComponent } from './csagent-login-form/csagent-login-form.component';
import { CustomerSelectionComponent } from './customer-selection/customer-selection.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    FeaturesConfigModule,
  ],
  declarations: [
    AsmComponent,
    CSAgentLoginFormComponent,
    CustomerSelectionComponent,
    AsmRootComponent,
  ],
  exports: [AsmRootComponent],
})
export class AsmModule {}
