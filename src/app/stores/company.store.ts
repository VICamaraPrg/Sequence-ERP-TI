import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { Company, CompanyForSelect } from '../core/models/company';
import { CompanyService } from '../services/company.service';

interface ICompanyStore {
  companies: Company[];
  loading: boolean;
}

const initialState: ICompanyStore = {
  companies: [],
  loading: false,
};

export const CompanyStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialState),
  withMethods((store, companyService = inject(CompanyService)) => ({
    async getAllCompanies() {
      patchState(store, { loading: true });

      const companies = await lastValueFrom(companyService.getAllCompanies());

      patchState(store, {
        companies,
        loading: false,
      });
    },

    setSongToCompany(songId: string, companyId: string) {
      const updatedCompanies = store.companies().map((company: Company) => {
        if (company.id === companyId) {
          return {
            ...company,
            songs: [...company.songs, songId],
          };
        }
        return company;
      });

      patchState(store, { companies: updatedCompanies });
    },

    getCompanyBySongId(songId: string): CompanyForSelect | undefined {
      const foundCompany = store
        .companies()
        .find((company: Company) => company.songs.includes(songId));

      return foundCompany
        ? {
            company: foundCompany.name,
            id: foundCompany.id,
          }
        : undefined;
    },

    getAllCompaniesForSelect() {
      return store.companies().map((company: Company) => ({
        company: company.name,
        id: company.id,
      }));
    },
  })),
  withHooks({
    onInit(store) {
      store.getAllCompanies();
    },
  }),
);
