import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { LanguageSelectComponent } from '../language-select.component';

@Component({
  selector: 'app-language-select',
  imports: [
    SelectModule,
    DialogModule,
    CommonModule,
    FormsModule,
    LanguageSelectComponent,
  ],
  templateUrl: './language-select-dialog.component.html',
})
export class LanguageSelectDialogComponent {}
