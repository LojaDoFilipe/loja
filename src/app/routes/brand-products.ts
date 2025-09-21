import { ChangeDetectionStrategy, Component, computed, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { PRODUCTS } from '../data/products';
import type { Product, Brand } from '../models/product';
import { ProductCardComponent } from '../components/product-card';

@Component({
  standalone: true,
  selector: 'brand-products',
  imports: [ProductCardComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (brand()) {
    <div class="brand-products-view">
      <div class="brand-header">
        <a routerLink="/" class="back-to-brands">← Voltar para Marcas</a>
        <div class="search-row">
          <input
            type="search"
            placeholder="Pesquisar produtos da marca {{ brand() }}..."
            [value]="search()"
            (input)="onSearch($any($event.target).value)"
            class="search-input"
            aria-label="Pesquisar produtos da marca {{ brand() }}..." />
          @if (sizes().length > 1) {
            <div class="size-filter-chips">
              <span class="size-filter-label">Filtrar por tamanho:</span>
              @for (size of sizes(); track size) {
                <button type="button" class="size-chip" [class.active]="selectedSize() === size" (click)="onSizeChange(size)">{{ size }}</button>
              }
              <button type="button" class="size-chip" [class.active]="selectedSize() === ''" (click)="onSizeChange('')">Todos</button>
            </div>
          }
        </div>
      </div>
      @defer (on idle) {
        <div class="product-list-grid">
          @for (product of filtered(); let i = $index; track product.id) {
            <product-card [product]="product" [priority]="i === 0" (imageClicked)="openImage(product)" (addToCartClicked)="add(product)" />
          } @if (filtered().length === 0) {
            <div class="no-products">Nenhum produto encontrado.</div>
          }
        </div>
      } @placeholder {
        <div style="padding:2rem;text-align:center;color:var(--color-text-muted)">Carregando produtos...</div>
      }
    </div>
    } @else {
      <div style="padding:2rem;text-align:center">Marca não encontrada. <a routerLink="/">Voltar</a></div>
    }

    @if (selectedImage()) {
      <div class="image-modal" (click)="onBackdrop($event)" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
        <button class="nav-arrow prev" type="button" (click)="prev($event)">‹</button>
        <img [src]="selectedImage()" alt="Product image" class="modal-img" />
        <button class="nav-arrow next" type="button" (click)="next($event)">›</button>
      </div>
    }

  <!-- cart-fab removed: only render in app.html -->
  `,
  styleUrls: ['../components/product-list.scss']
})
export class BrandProductsComponent {
  selectedSize = signal<string>('');

  sizes = computed(() => {
    // Use all products for the current brand for available sizes
    const b = this.brand();
    if (!b) return [];
    const brandProducts = this.products().filter(p => p.brand === b);
    const allSizes = brandProducts.map((p) => p.size).filter((s): s is string => typeof s === 'string' && s.length > 0);
    const uniqueSizes = Array.from(new Set(allSizes));
    // Only show filter if more than one unique size
    return uniqueSizes.length > 1 ? uniqueSizes : [];
  });

  onSizeChange(value: string) {
    this.selectedSize.set(value);
  }
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  private readonly products = signal<Product[]>(PRODUCTS);

  brand = signal<Brand | null>(null);
  search = signal('');
  selectedImage = signal<string | null>(null);
  private touchStartX = 0;
  private touchEndX = 0;

  currentIndex = computed(() => {
    const img = this.selectedImage();
    if (!img) return -1;
    return this.filtered().findIndex(p => p.imageUrl === img);
  });

  nextIndex(delta: number) {
    const list = this.filtered();
    if (!list.length) return -1;
    let idx = this.currentIndex();
    if (idx === -1) return -1;
    idx = (idx + delta + list.length) % list.length;
    return idx;
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const b = params.get('brand') as Brand | null;
      if (!b) {
        this.brand.set(null);
        return;
      }
      // Validate brand
      const exists = this.products().some(p => p.brand === b);
      if (!exists) {
        this.brand.set(null);
      } else {
        this.brand.set(b);
        this.search.set('');
      }
    });
  }

  filtered = computed(() => {
    const b = this.brand();
    if (!b) return [] as Product[];
    const term = this.search().toLowerCase().trim();
    const size = this.selectedSize();
    // Split search into words, match all
    const words = term.split(/\s+/).filter(Boolean);
    return this.products().filter(p => {
      if (p.brand !== b) return false;
      const name = p.name.toLowerCase();
      const prodSize = p.size ? p.size.toLowerCase() : '';
      // Each word must match either name or size
      const searchMatch = words.every(w => name.includes(w) || prodSize.includes(w));
      const sizeMatch = !size || p.size === size;
      return (!term || searchMatch) && sizeMatch;
    });
  });

  onSearch(value: string) { this.search.set(value); }
  openImage(product: Product) { this.selectedImage.set(product.imageUrl); }
  closeImage() { this.selectedImage.set(null); }

  add(product: Product) { this.cart.add(product, 1); }
  openImageUrl(url: string) { this.selectedImage.set(url); }

  next(ev?: Event) {
    ev?.stopPropagation();
    const ni = this.nextIndex(1);
    if (ni >= 0) this.selectedImage.set(this.filtered()[ni].imageUrl);
  }
  prev(ev?: Event) {
    ev?.stopPropagation();
    const pi = this.nextIndex(-1);
    if (pi >= 0) this.selectedImage.set(this.filtered()[pi].imageUrl);
  }

  onBackdrop(ev: Event) {
    // close only if clicked backdrop (not arrows or image)
    if (ev.target instanceof HTMLElement && ev.target.classList.contains('image-modal')) {
      this.closeImage();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(ev: KeyboardEvent) {
    if (!this.selectedImage()) return;
    if (ev.key === 'ArrowRight') { this.next(); ev.preventDefault(); }
    else if (ev.key === 'ArrowLeft') { this.prev(); ev.preventDefault(); }
    else if (ev.key === 'Escape') { this.closeImage(); }
  }

  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
    }
  }
  onTouchEnd(e: TouchEvent) {
    if (!this.touchStartX) return;
    this.touchEndX = e.changedTouches[0].clientX;
    const diff = this.touchEndX - this.touchStartX;
    const threshold = 40; // px
    if (Math.abs(diff) > threshold) {
      if (diff < 0) this.next(); else this.prev();
    }
    this.touchStartX = 0; this.touchEndX = 0;
  }
}
