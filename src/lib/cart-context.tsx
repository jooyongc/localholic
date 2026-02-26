"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  thumbnailUrl: string | null;
  region: string | null;
  quantity: number;
  selectedOptions: Record<string, string>;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedOptions: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedOptions: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

const STORAGE_KEY = "localholic_cart";

function optionsKey(opts: Record<string, string>): string {
  return Object.entries(opts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

function matchItem(
  a: CartItem,
  productId: string,
  selectedOptions: Record<string, string>
) {
  return (
    a.productId === productId &&
    optionsKey(a.selectedOptions) === optionsKey(selectedOptions)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        matchItem(i, item.productId, item.selectedOptions)
      );
      if (existing) {
        return prev.map((i) =>
          matchItem(i, item.productId, item.selectedOptions)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, selectedOptions: Record<string, string>) => {
      setItems((prev) =>
        prev.filter((i) => !matchItem(i, productId, selectedOptions))
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      selectedOptions: Record<string, string>,
      quantity: number
    ) => {
      if (quantity <= 0) {
        removeItem(productId, selectedOptions);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          matchItem(i, productId, selectedOptions)
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
