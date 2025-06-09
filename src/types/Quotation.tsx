export type QuotationItem = {
  name: string;
  description: string;
  quantity: number;
  price: number;
};

export type Quotation = {
  _id?: string;
  client: string;
  number: string;
  year: string;
  currency: string;
  status: string;
  date: string;
  expireDate: string;
  note: string;
  items: QuotationItem[];
  taxValue: number;
};
