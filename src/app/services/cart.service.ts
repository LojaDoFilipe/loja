import { Injectable, computed, signal, effect } from '@angular/core';
import type { Product } from '../models/product';

export interface CartItem {
  id: string; // product id
  name: string;
  price: number; // snapshot price
  imageUrl: string;
  qty: number;
  size?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'cart-v1';
  private readonly _items = signal<CartItem[]>(this.restore());
  private readonly shippingId = '__shipping__';
  private readonly shippingLabel = 'Portes de Envio';
  private readonly baseShipping = 5; // €
  private readonly freeShippingThreshold = 60; // € (products subtotal)

  /** Core (non-shipping) items */
  private readonly coreItems = computed(() => this._items().filter(i => i.id !== this.shippingId));
  /** Derived shipping item (virtual) */
  /** Subtotal of products only */
  readonly subtotal = computed(() => this.coreItems().reduce((acc, i) => acc + i.qty * i.price, 0));
  private readonly shippingItem = computed<CartItem | null>(() => {
    const coreTotal = this.subtotal();
    if (coreTotal <= 0) return null; // nothing in cart
    const price = coreTotal >= this.freeShippingThreshold ? 0 : this.baseShipping;
    return { id: this.shippingId, name: this.shippingLabel, price, imageUrl: '', qty: 1 };
  });
  /** Public shipping accessor (without injecting into items list) */
  shipping = computed(() => this.shippingItem());
  /** Public items signal including shipping row if applicable */
  items = computed(() => {
    const core = this.coreItems();
    const ship = this.shippingItem();
    return ship ? [...core, ship] : core;
  });
  totalQuantity = computed(() => this.coreItems().reduce((acc, i) => acc + i.qty, 0));
  /** Number of distinct product lines */
  distinctCount = computed(() => this.coreItems().length);
  totalPrice = computed(() => this.subtotal() + (this.shippingItem()?.price ?? 0));

  constructor() {
    effect(() => {
      // Persist only core items; shipping derived
      const data = JSON.stringify(this.coreItems());
      try { localStorage.setItem(this.storageKey, data); } catch {}
    });
  }

  private restore(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => p?.id && p?.qty > 0);
      }
      return [];
    } catch { return []; }
  }

  add(product: Product, qty = 1) {
    if (qty <= 0) return;
    const list = [...this.coreItems()];
    const idx = list.findIndex(i => i.id === product.id && i.size === product.size);
    if (idx >= 0) {
      list[idx] = { ...list[idx], qty: list[idx].qty + qty };
    } else {
      list.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty, size: product.size });
    }
    this._items.set(list);
  }

  setQuantity(productId: string, qty: number, size?: string) {
    if (qty <= 0) {
      this.remove(productId, size);
      return;
    }
    const list = this.coreItems().map(i => i.id === productId && i.size === size ? { ...i, qty } : i);
    this._items.set(list);
  }

  remove(productId: string, size?: string) {
    if (productId === this.shippingId) return; // ignore attempts
    this._items.set(this.coreItems().filter(i => !(i.id === productId && i.size === size)));
  }

  clear() { this._items.set([]); }
}
