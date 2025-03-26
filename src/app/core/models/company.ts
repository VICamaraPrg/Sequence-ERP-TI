export interface Company {
  id: string;
  name: string;
  country: string;
  createYear: number;
  employees: number;
  rating: number;
  songs: string[];
}

export interface CompanyResponse {
  companies: Company[];
}

export interface CompanyForSelect {
  id: string;
  company: string;
}
