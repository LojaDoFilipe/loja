import type { Brand } from './brand';
export type { Brand } from './brand';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: Brand;
}
