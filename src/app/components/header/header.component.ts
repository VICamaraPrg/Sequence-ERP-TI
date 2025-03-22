import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-header',
  imports: [DrawerModule, ButtonModule, RouterModule, DividerModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  visible = false;
}
