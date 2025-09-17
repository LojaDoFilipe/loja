
import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { ProductCardComponent } from './product-card';
import { PRODUCTS } from '../data/products';
import type { Product, Brand } from '../models/product';

@Component({
  selector: 'product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'product-list',
  },
  imports: [ProductCardComponent],
  template: `
    @if (!selectedBrand()) {
      <div class="brand-select-list">
        <h2 class="brand-select-title">Escolha a Marca</h2>
        <div class="brand-select-grid">
          @for (brand of brands(); track brand) {
            <button class="brand-card" (click)="selectBrand(brand)">
              <span class="brand-name">{{ brand }}</span>
            </button>
          }
        </div>
      </div>
    } @else {
      <div class="brand-products-view">
        <div class="brand-header">
          <button class="back-to-brands" (click)="clearBrand()">← Voltar para Marcas</button> 
           <h2>{{ selectedBrand() }}</h2>
        </div>
        <div class="search-bar">
          <input
            type="search"
            placeholder="Pesquisar produtos da marca {{ selectedBrand() }}..."
            [value]="search()"
            (input)="onSearch($event.target.value)"
            class="search-input"
            aria-label="Pesquisar produtos da marca {{ selectedBrand() }}..."
          />
        </div>
        <div class="product-list-grid">
          @for (product of filteredByBrand(selectedBrand()); track product.id) {
            <product-card
              [product]="product"
              (imageClicked)="openImage(product)"
            />
          }
          @if (filteredByBrand(selectedBrand()).length === 0) {
            <div class="no-products">Nenhum produto encontrado.</div>
          }
        </div>
      </div>
    }
    @if (selectedImage()) {
      <div class="image-modal" (click)="closeImage()">
        <img [src]="selectedImage()" alt="Product image" class="modal-img" />
      </div>
    }
  `,
  styleUrls: ['./product-list.scss'],
})
export class ProductListComponent {
  products = signal<Product[]>(PRODUCTS);
  search = signal('');
  selectedImage = signal<string | null>(null);
  selectedBrand = signal<Brand | null>(null);

  brands = computed(() => {
    const allBrands = this.products().map(p => p.brand);
    return Array.from(new Set(allBrands));
  });

  filteredByBrand = (brand: Brand | null) => {
    if (!brand) return [];
    const term = this.search().toLowerCase();
    return this.products().filter(p =>
      p.brand === brand &&
      p.name.toLowerCase().includes(term)
    );
  };

  selectBrand(brand: Brand) {
    this.selectedBrand.set(brand);
    this.search.set('');
  }

  clearBrand() {
    this.selectedBrand.set(null);
    this.search.set('');
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  openImage(product: Product) {
    this.selectedImage.set(product.imageUrl);
  }

  closeImage() {
    this.selectedImage.set(null);
  }
}
