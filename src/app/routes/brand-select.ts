import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PRODUCTS } from '../data/products';
import type { Brand } from '../models/product';

@Component({
  standalone: true,
  selector: 'brand-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brand-select-list">
      <h2 class="brand-select-title">Escolha a Marca dos Palhaços</h2>
      <div class="brand-select-grid">
        @for (brand of brands(); track brand) {
        <button class="brand-card" (click)="go(brand)" [attr.aria-label]="brand">
          <img [src]="brandImage(brand)" [alt]="brand" class="brand-image" />
        </button>
        }
      </div>
    </div>
  `,
  styleUrls: ['../components/product-list.scss'],
  styles: [
    `
      .brand-select-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .brand-card {
        position: relative;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 1rem 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 170px;
        transition: 0.25s box-shadow, 0.25s transform, 0.25s border-color;
      }
      .brand-card:hover,
      .brand-card:focus {
        box-shadow: var(--elev-2);
        border-color: var(--color-primary);
      }
      .brand-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
      }
      .brand-name {
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      @media (max-width: 640px) {
        .brand-select-list {
          padding: 0 0.85rem;
        }
        .brand-select-grid {
          gap: 0.75rem;
          grid-template-columns: repeat(2, 1fr);
        }
        .brand-card {
          padding: 0.85rem 0.65rem;
          min-height: 130px;
        }
        .brand-image {
          max-height: 100px;
        }
      }
    `,
  ],
})
export class BrandSelectComponent {
  private readonly router = inject(Router);
  private readonly products = signal(PRODUCTS);
  brands = computed(() => Array.from(new Set(this.products().map((p) => p.brand))));

  brandImage(brand: Brand): string {
    // Map brand literal to file names provided by user
    switch (brand) {
         case 'PROCHOCO':
        return 'assets/images/marcas/prochoco.jpg';
      case 'Yo-Zuri':
        return 'assets/images/marcas/yozuri.jpg';
      case 'Killer':
        return 'assets/images/marcas/killer.jpg';
      case 'Yamashita':
        return 'assets/images/marcas/yamashita.jpg';
      case 'DTD':
        return 'assets/images/marcas/DTD.jpg';
      case 'lowcost':
        return 'assets/images/marcas/lowCost.jpg';
      default:
        return 'assets/images/marcas/tag.jpg';
    }
  }

  go(brand: Brand) {
    this.router.navigate(['/', brand]);
  }
}
