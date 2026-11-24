import { beforeEach, describe, expect, it } from 'vitest';
import { selectCartCount, useCartStore } from './store';

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it('adds a new item and defaults quantity to 1', () => {
    useCartStore.getState().addItem('prod-1');

    expect(useCartStore.getState().items).toEqual([{ productId: 'prod-1', quantity: 1 }]);
  });

  it('merges quantities when adding an existing item and caps at 99', () => {
    useCartStore.getState().addItem('prod-1', 2);
    useCartStore.getState().addItem('prod-1', 3);

    expect(useCartStore.getState().items).toEqual([{ productId: 'prod-1', quantity: 5 }]);

    useCartStore.getState().addItem('prod-1', 200);
    expect(useCartStore.getState().items).toEqual([{ productId: 'prod-1', quantity: 99 }]);
  });

  it('clamps added quantity to at least 1', () => {
    useCartStore.getState().addItem('prod-1', 0);
    useCartStore.getState().addItem('prod-2', -5);

    expect(useCartStore.getState().items).toEqual([
      { productId: 'prod-1', quantity: 1 },
      { productId: 'prod-2', quantity: 1 },
    ]);
  });

  it('updates item quantity and removes item when set to 0 or negative', () => {
    useCartStore.getState().addItem('prod-1', 2);
    useCartStore.getState().addItem('prod-2', 1);

    useCartStore.getState().setQuantity('prod-1', 7);
    expect(useCartStore.getState().items).toEqual([
      { productId: 'prod-1', quantity: 7 },
      { productId: 'prod-2', quantity: 1 },
    ]);

    useCartStore.getState().setQuantity('prod-1', 150);
    expect(useCartStore.getState().items[0]).toEqual({ productId: 'prod-1', quantity: 99 });

    useCartStore.getState().setQuantity('prod-1', 0);
    expect(useCartStore.getState().items).toEqual([{ productId: 'prod-2', quantity: 1 }]);

    useCartStore.getState().setQuantity('prod-2', -1);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('removes a single item without affecting others', () => {
    useCartStore.getState().addItem('prod-1', 2);
    useCartStore.getState().addItem('prod-2', 4);

    useCartStore.getState().removeItem('prod-1');

    expect(useCartStore.getState().items).toEqual([{ productId: 'prod-2', quantity: 4 }]);
  });

  it('clears all items', () => {
    useCartStore.getState().addItem('prod-1', 2);
    useCartStore.getState().addItem('prod-2', 4);

    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('computes total item count via selectCartCount', () => {
    expect(selectCartCount(useCartStore.getState())).toBe(0);

    useCartStore.getState().addItem('prod-1', 2);
    useCartStore.getState().addItem('prod-2', 3);

    expect(selectCartCount(useCartStore.getState())).toBe(5);
  });
});
