import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterModule,
    DividerModule,
    TooltipModule,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly translate = inject(TranslateService);

  visible = false;
}
