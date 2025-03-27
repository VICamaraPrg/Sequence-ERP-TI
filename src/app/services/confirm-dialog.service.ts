import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class CustomConfirmDialogService {
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  confirm(
    target: EventTarget,
    confirmMessage: string,
    confirmAction: string,
    acceptCallback: () => void,
    cancelCallback?: () => void,
  ): void {
    this.confirmationService.confirm({
      target,
      message: confirmMessage,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: this.translate.instant('songModal.form.action.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: confirmAction,
        severity: 'danger',
      },
      accept: () => {
        acceptCallback();
      },
      reject: () => {
        if (cancelCallback) {
          cancelCallback();
        }
      },
    });
  }
}
