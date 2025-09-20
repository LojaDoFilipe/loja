import type { Brand } from './brand';
export type { Brand } from './brand';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: Brand;
  /** Flag indicating product is newly added/promoted */
  size?: string;
  isNew?: boolean;
}
