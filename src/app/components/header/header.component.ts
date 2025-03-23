import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterModule,
    DividerModule,
    TooltipModule,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  visible = false;
}
