import { ChangeDetectionStrategy, Component, input, output, inject, computed } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import type { Product } from '../models/product';
import { ToastService } from '../services/toast.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'product-card',
    tabindex: '0',
    role: 'group',
  },
  template: `
    <div class="card-content">
      <div class="media-wrapper" (click)="showImage()">
        @if (product()?.isNew) {
          <span class="badge-new" aria-label="Novo" title="Novo">NOVO</span>
        }
        <img
          ngOptimizedImage
          [ngSrc]="product()?.imageUrl ?? ''"
          width="210"
          height="280"
          [priority]="priority"
          alt="{{ product()?.name }}"
          class="product-image"
        />
      </div>
      <div class="product-info">
        <span class="product-name">
          {{ product()?.name?.toUpperCase() }}
          @if (product()?.size) {
            <span class="product-size"> {{ product()?.size }}</span>
          }
        </span>
        <span class="product-price">{{ product()?.price }} €</span>
        @if (qty() === 0) {
          <button type="button" class="add-cart-btn" (click)="addToCart($event)">Adicionar</button>
        } @else {
          <div class="qty-controls" aria-label="Quantidade no carrinho">
            <button type="button" class="qty-btn dec" (click)="decrement($event)" aria-label="Remover 1">−</button>
            <span class="qty" aria-live="polite">{{ qty() }}</span>
            <button type="button" class="qty-btn inc" (click)="increment($event)" aria-label="Adicionar 1">+</button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./product-card.scss'],
  imports: [NgOptimizedImage],
})
export class ProductCardComponent {
  product = input<Product>();
  // Allow parent to mark one image as priority (e.g., first LCP candidate)
  priority = input<boolean>(false);
  imageClicked = output<void>();
  addToCartClicked = output<void>();
  currency = new CurrencyPipe('en');
  private readonly toast = inject(ToastService);
  private readonly cart = inject(CartService);
  private lastAddTs = 0;
  // current quantity for this product in cart
  qty = computed(() => {
  const p = this.product();
  if (!p) return 0;
  return this.cart.items().find(i => i.id === p.id && i.size === p.size)?.qty ?? 0;
  });

  showImage() {
    this.imageClicked.emit();
  }

  addToCart(ev: Event) {
    ev.stopPropagation();
    const now = performance.now();
    if (now - this.lastAddTs < 250) { return; } // debounce rapid double tap/click
    this.lastAddTs = now;
    this.addToCartClicked.emit();
    const name = this.product()?.name?.toUpperCase() ?? 'PRODUTO';
    const p = this.product();
    if (p) {
      if (this.qty() === 0) {
        this.cart.add(p, 1);
      }
      this.toast.show(`${name}${p.size ? ' ' + p.size : ''} adicionado ao carrinho`, { timeout: 2000 });
    } else {
      this.toast.show('Erro ao adicionar produto');
    }
  }

  increment(ev: Event) {
    ev.stopPropagation();
  const p = this.product();
  if (!p) return;
  this.cart.add(p, 1);
  this.toast.show(`${p.name.toUpperCase()}${p.size ? ' ' + p.size : ''} adicionado ao carrinho`, { timeout: 2000 });
  }

  decrement(ev: Event) {
    ev.stopPropagation();
    const p = this.product();
    if (!p) return;
    const current = this.qty();
    if (current <= 1) {
      // remove item by setting qty to 0 via remove
      this.cart.remove(p.id, p.size);
      this.toast.show(`${p.name.toUpperCase()}${p.size ? ' ' + p.size : ''} removido do carrinho`, { timeout: 2000 });
    } else {
      this.cart.setQuantity(p.id, current - 1, p.size);
      this.toast.show(`${p.name.toUpperCase()}${p.size ? ' ' + p.size : ''} removido do carrinho`, { timeout: 2000 });
    }
  }
}
