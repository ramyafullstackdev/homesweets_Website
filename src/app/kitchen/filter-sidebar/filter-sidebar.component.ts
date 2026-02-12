import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KitchenService } from '../kitchen.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/services';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent {
  activeFilterCount = 0;
  priceMin: number = 0;
  priceMax: number = 5000;
  inStockOnly = false;
  filters = {
    inStock: false,
    outOfStock: false,
    preOrder: false,
    price: { min: 0, max: 5000 },
  };
  categories: any[] = [];

  variants = [
    { label: 'Small', count: 1, selected: false },
    { label: 'Medium', count: 1, selected: false },
    { label: '100g', count: 2, selected: false },
    { label: '150g', count: 6, selected: false },
    { label: '200g', count: 3, selected: false },
    { label: '250g', count: 4, selected: false }
  ];
  isExclsive: boolean = false;
  mainPageFilter: any;
  kitchenDetail: any;

  constructor(private kitchenService: KitchenService, private route: ActivatedRoute, private messageService: MessageService, private router: Router) {
    let kitchenData = localStorage.getItem("selectedKitchen");
    this.kitchenDetail = kitchenData ? JSON.parse(kitchenData) : {};
    this.mainPageFilter = this.router.url;
    if (this.mainPageFilter.includes('exclusive')) {
      this.isExclsive = true;
    } else {
      this.isExclsive = false;
    }
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        // this.categoryName = params['id'] || '';
        this.getCategory(params['id']);

      } else {
        this.getCategory();

      }

    });
  }

  toggleVariant(variant: any) {
    variant.selected = !variant.selected;
    this.updateActiveFilterCount();
  }

  updateActiveFilterCount() {
    const selectedCategories = this.categories.reduce((count, cat) => {
      const selectedSub = cat.subcategories?.filter((s: any) => s.selected).length || 0;
      return count + (cat.selected ? 1 : 0) + selectedSub;
    }, 0);

    const selectedVariants = this.variants.filter(v => v.selected).length;
    const priceSelected = this.priceMin || this.priceMax ? 1 : 0;
    const availabilitySelected = this.inStockOnly ? 1 : 0;

    this.activeFilterCount =
      selectedCategories + selectedVariants + priceSelected + availabilitySelected;
  }

  clearAll(event: Event) {
    event.preventDefault();
    this.categories.forEach(c => {
      c.selected = false;
      c.subcategories?.forEach((s: any) => (s.selected = false));
    });
    this.variants.forEach(v => (v.selected = false));
    this.priceMin = 0;
    this.priceMax = 1000;
    this.inStockOnly = false;
    this.activeFilterCount = 0;
  }

  applyFilters() {
    const appliedFilters = {
      categories: this.categories
        .filter(c => c.selected || c.subcategories?.some((s: any) => s.selected))
        .map(c => ({
          name: c.name,
          sub: c.subcategories?.filter((s: any) => s.selected).map((s: any) => s.name) || []
        })),
      price: { min: this.priceMin, max: this.priceMax },
      variants: this.variants.filter(v => v.selected).map(v => v.label),
      inStockOnly: this.inStockOnly
    };

  }

  getCategory(categoryName?: string) {
    this.kitchenService.getCategoriesForFilter({ categoryIds: this.categoryIds, kitchen: this.kitchenDetail?._id }).subscribe({
      next: (result) => {
        this.categories = result.response || [];

        this.categories.forEach(cat => {
          cat.selected = false;

          // If main category matches name
          if (categoryName && cat.categoryName === categoryName) {
            cat.selected = true;

            // Select all subcategories as true as well
            if (cat.subcategories && cat.subcategories.length) {
              cat.subcategories.forEach((subcat: any) => {
                subcat.selected = true;
              });
            }
            cat.expanded = !cat.expanded
          } else if (cat.subcategories && cat.subcategories.length) {
            // else check if any subcategory matches
            cat.subcategories.forEach((subcat: any) => {
              if (categoryName && subcat.categoryName === categoryName) {
                subcat.selected = true;
              } else {
                subcat.selected = false;
              }
            });
          }

        });
        
        this.categories = this.moveCategoryToFront(this.categories, categoryName)
        this.updateActiveFilterCount();
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        console.info('complete');
      }
    });
  }

  moveCategoryToFront(categories: any[], categoryName: any): any[] {
    if (categoryName) {
      const idx = categories.findIndex(cat => cat.categoryName === categoryName);
      if (idx === -1) return categories; 
      const [category] = categories.splice(idx, 1);
      categories.unshift(category);

      return categories;
    } else {
      return categories
    }

  }
  categoryIds: any[] = [];
  // async onCategoryChange(category: any, type: string) {
  //   if (type === 'main') {
  //     // If main category is selected/deselected, update all subcategories
  //     if (category.selected) {
  //       category.subcategories?.forEach((subcat: any) => {
  //         subcat.selected = true;
  //       });
  //     } else {
  //       category.subcategories?.forEach((subcat: any) => {
  //         subcat.selected = false;
  //       });
  //     }
  //   } else if (type === 'sub') {
  //     // If any subcategory is selected, ensure main category is selected
  //     if (category.subcategories?.some((subcat: any) => subcat.selected)) {
  //       category.selected = true;
  //     } else {
  //       category.selected = false;
  //     }
  //   }
  //   this.updateActiveFilterCount();
  //   this.categoryIds = await this.getSelectedCategoryIds();
  //   this.messageService.sendMessage({category:true , categoryIds:this.categoryIds, product: this.kitchenDetail? false :  true });
  // }
  async onCategoryChange(node: any, level: string, parent1?: any, parent2?: any) {

    /* -------------------------- MAIN CATEGORY -------------------------- */
    if (level === 'main') {
      // Main selected/unselected → update all children
      node.subcategories?.forEach((sub1: any) => {
        sub1.selected = node.selected;
        sub1.subcategories?.forEach((sub2: any) => {
          sub2.selected = node.selected;
        });
      });
    }

    /* ----------------------- SUB CATEGORY (LEVEL 2) ----------------------- */
    else if (level === 'sub') {

      // If sub selected/unselected → update its children (level 3)
      node.subcategories?.forEach((sub2: any) => {
        sub2.selected = node.selected;
      });

      // Update parent (main)
      parent1.selected =
        parent1.subcategories.some((s1: any) => s1.selected) || false;
    }

    /* ---------------------- SUB-SUB CATEGORY (LEVEL 3) ---------------------- */
    else if (level === 'sub2') {

      // Update immediate parent (level 2)
      parent1.selected =
        parent1.subcategories.some((s2: any) => s2.selected) || false;

      // Update main (level 1)
      parent2.selected =
        parent2.subcategories.some((s1: any) => s1.selected) || false;
    }

    /* ----------------------------- COMMON PART ----------------------------- */

    this.updateActiveFilterCount();
    this.categoryIds = await this.getSelectedCategoryIds();

    this.messageService.sendMessage({
      category: true,
      categoryIds: this.categoryIds,
      product: this.kitchenDetail._id ? false : true
    });
  }


  getSelectedCategoryIds() {
    const selectedIds: any[] = [];

    this.categories.forEach(category => {
      if (category.selected && category._id) {
        selectedIds.push(category._id);
      }
      if (category.subcategories && category.subcategories.length) {
        category.subcategories.forEach((sub: any) => {
          if (sub.selected && sub._id) {
            selectedIds.push(sub._id);
          }
        });
      }
    });

    return selectedIds;
  }

  onAvailabilityChange() {
    // Construct the current filter state from availability checkboxes
    const availabilityFilters = {
      inStock: this.filters.inStock,
      outOfStock: this.filters.outOfStock,
      preOrder: this.filters.preOrder
    };
    this.messageService.sendMessage({ availability: true, availabilityFilters, product: this.kitchenDetail._id ? false : true });
  }

  onPriceChange(event: any, type: string) {
    if (type === 'min') {
      this.filters.price.min = event.target.value;
    } else if (type === 'max') {
      this.filters.price.max = event.target.value;
    }
    this.messageService.sendMessage({ price: true, priceRange: this.filters.price, product: this.kitchenDetail._id ? false : true });
  }

async toggleMainCategory(cat: any) {
  // Toggle the selected state of the main category
  cat.selected = !cat.selected;

  // If the main category has subcategories, update all children
  if (cat.subcategories?.length) {
    cat.subcategories.forEach((sub1: any) => {
      sub1.selected = cat.selected;
      if (sub1.subcategories?.length) {
        sub1.subcategories.forEach((sub2: any) => {
          sub2.selected = cat.selected;
        });
      }
    });

    // Toggle the expanded state for accordion
    cat.expanded = !cat.expanded;
  }

  // Update active filter count and selected category IDs
  this.updateActiveFilterCount();
  this.categoryIds = await this.getSelectedCategoryIds();

  // Send message to update filters
  this.messageService.sendMessage({
    category: true,
    categoryIds: this.categoryIds,
    product: this.kitchenDetail._id ? false : true
  });
}



}
