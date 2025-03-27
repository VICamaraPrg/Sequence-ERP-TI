import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-drawer',
  imports: [DrawerModule, ButtonModule, RouterModule, TranslatePipe],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent {
  drawerVisible = input.required<boolean>();
  readonly drawerClosed = output<void>();
}
