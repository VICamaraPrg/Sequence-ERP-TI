import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class HandleErrorService {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  handle<T>() {
    return (source: Observable<T>) =>
      source.pipe(
        catchError((error) => {
          this.notificationService.showError(
            error?.message,
            this.translateService.instant(
              'songModal.form.action.error.unexpected',
            ),
          );
          return of({ status: error.status || 500 } as unknown as T);
        }),
      );
  }
}
