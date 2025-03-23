import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../core/models/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly http: HttpClient = inject(HttpClient);

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`/api/companies`);
  }
}
