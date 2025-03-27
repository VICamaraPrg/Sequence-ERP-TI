import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { TranslateService } from '@ngx-translate/core';

export function handleError<T>(
  notificationService: NotificationService,
  translateService: TranslateService,
) {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error) => {
        notificationService.showError(
          error?.message,
          translateService.instant('songModal.form.action.error.unexpected'),
        );
        return of({ status: error.status || 500 } as unknown as T);
      }),
    );
}
