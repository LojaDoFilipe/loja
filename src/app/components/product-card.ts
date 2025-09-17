import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import type { Product } from '../models/product';

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
      <img
        ngOptimizedImage
        [ngSrc]="product()?.imageUrl ?? ''"
        width="400"
        height="277"
        alt="{{ product()?.name }}"
        (click)="showImage()"
        class="product-image"
      />
      <div class="product-info">
        <span class="product-name">{{ product()?.name }}</span>
        <span class="product-price">{{ product()?.price }} €</span>
      </div>
    </div>
  `,
  styleUrls: ['./product-card.scss'],
  imports: [NgOptimizedImage],
})
export class ProductCardComponent {
  product = input<Product>();
  imageClicked = output<void>();
  currency = new CurrencyPipe('en');

  showImage() {
    this.imageClicked.emit();
  }
}
