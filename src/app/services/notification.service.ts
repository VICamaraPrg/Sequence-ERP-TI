import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showSuccess(summary: string, detail: string, life = 3000): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life,
    });
  }

  showWarning(summary: string, detail: string, life = 3000): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life,
    });
  }

  showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      sticky: true,
    });
  }
}
