export interface Transaction {
  date: string;
  category: string;
  supplier: string;
  product: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  belgeNo?: string;
  stokKodu?: string;
}
