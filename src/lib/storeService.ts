import { Product, StoreReview, TikTokVideo, Category, Order, OrderStatus, Customer, StoreSettings } from '../types';
import { db, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from './firebase';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  TIKTOK_VIDEOS as INITIAL_TIKTOK_VIDEOS, 
  INITIAL_CATEGORIES, 
  INITIAL_ORDERS, 
  STORE_SETTINGS_DEFAULT 
} from '../data/storeData';

// Firestore Collection Names
const PRODUCTS_COLLECTION = 'products';
const TRASH_PRODUCTS_COLLECTION = 'trashed_products';
const TIKTOK_COLLECTION = 'tiktok_videos';
const TRASH_TIKTOK_COLLECTION = 'trashed_tiktoks';
const CATEGORIES_COLLECTION = 'categories';
const TRASH_CATEGORIES_COLLECTION = 'trashed_categories';
const ORDERS_COLLECTION = 'orders';
const TRASH_ORDERS_COLLECTION = 'trashed_orders';
const SETTINGS_COLLECTION = 'store_settings';
const SETTINGS_DOC_ID = 'main_config';

// Local Storage Keys for offline resiliency
const LOCAL_PRODUCTS_KEY = 'leslie_store_custom_products';
const LOCAL_TRASH_PRODUCTS_KEY = 'leslie_store_trashed_products';
const LOCAL_TIKTOK_KEY = 'leslie_store_custom_tiktoks';
const LOCAL_TRASH_TIKTOK_KEY = 'leslie_store_trashed_tiktoks';
const LOCAL_CATEGORIES_KEY = 'leslie_store_custom_categories';
const LOCAL_TRASH_CATEGORIES_KEY = 'leslie_store_trashed_categories';
const LOCAL_ORDERS_KEY = 'leslie_store_custom_orders';
const LOCAL_TRASH_ORDERS_KEY = 'leslie_store_trashed_orders';
const LOCAL_SETTINGS_KEY = 'leslie_store_custom_settings';

// ==========================================
// 1. PRODUCTS MANAGEMENT
// ==========================================

function mergeMissingCatalogProducts(existingProducts: Product[]): Product[] {
  const defaultById = new Map(INITIAL_PRODUCTS.map((product) => [product.id, product]));

  // These three entries used duplicated catalog photos in the previous release.
  // Migrate only when the stored product still points to the old seeded image, so
  // custom images uploaded from the admin panel are never overwritten.
  const seededImageMigrations: Record<string, string> = {
    'prod-8': '/images/hoodie-1977.webp',
    'prod-10': '/images/neon-face.webp',
    'prod-12': '/images/white-skull.webp'
  };

  const migratedProducts = existingProducts.map((product) => {
    const oldSeedImage = seededImageMigrations[product.id];
    const currentDefault = defaultById.get(product.id);

    if (!oldSeedImage || !currentDefault || product.image !== oldSeedImage) {
      return product;
    }

    return {
      ...product,
      name: currentDefault.name,
      brand: currentDefault.brand,
      category: currentDefault.category,
      image: currentDefault.image,
      galleryImages: currentDefault.galleryImages,
      colors: currentDefault.colors,
      description: currentDefault.description,
      features: currentDefault.features,
      tag: currentDefault.tag,
      isNew: currentDefault.isNew,
      isFeatured: currentDefault.isFeatured,
      isViral: currentDefault.isViral
    };
  });

  const existingIds = new Set(migratedProducts.map((product) => product.id));
  const missingDefaults = INITIAL_PRODUCTS.filter((product) => !existingIds.has(product.id));

  return [...migratedProducts, ...missingDefaults];
}

export function getLocalProducts(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mergedProducts = mergeMissingCatalogProducts(parsed as Product[]);
        if (mergedProducts.length !== parsed.length) {
          saveLocalProducts(mergedProducts);
        }
        return mergedProducts;
      }
    }
  } catch (e) {
    console.warn('Error reading products from localStorage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Error saving products to localStorage', e);
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    if (!snapshot.empty) {
      const prods: Product[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Product;
        prods.push({ ...data, id: docSnap.id });
      });

      // Automatically add products introduced by a newer catalog release without
      // overwriting products that may have been edited from the admin panel.
      const mergedProducts = mergeMissingCatalogProducts(prods);
      const originalById = new Map(prods.map((product) => [product.id, product]));
      const productsToSync = mergedProducts.filter((product) => {
        const original = originalById.get(product.id);
        return !original || original.image !== product.image;
      });

      for (const product of productsToSync) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product, { merge: true });
      }

      saveLocalProducts(mergedProducts);
      return mergedProducts;
    } else {
      console.log('Seeding initial products to Firestore...');
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, p.id), p);
      }
      saveLocalProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore, falling back to local state:', err);
    return getLocalProducts();
  }
}

export async function saveProduct(product: Product): Promise<Product> {
  // Calculate total stock from sizeInventory if provided
  let totalStock = product.stockCount;
  if (product.sizeInventory && Object.keys(product.sizeInventory).length > 0) {
    totalStock = Object.values(product.sizeInventory).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  }

  const prodWithUsd: Product = {
    ...product,
    priceUSD: product.priceUSD || Math.round(product.priceCRC / 515),
    stockCount: totalStock,
    inStock: totalStock === 0 ? false : product.inStock
  };

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, prodWithUsd.id), prodWithUsd, { merge: true });
  } catch (err) {
    console.warn('Firestore write error, falling back to localStorage:', err);
  }

  const current = getLocalProducts();
  const index = current.findIndex(p => p.id === prodWithUsd.id);
  let updated: Product[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = prodWithUsd;
  } else {
    updated = [prodWithUsd, ...current];
  }
  saveLocalProducts(updated);
  return prodWithUsd;
}

export async function removeProduct(productId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn('Firestore delete error, falling back to localStorage:', err);
  }

  const current = getLocalProducts();
  const updated = current.filter(p => p.id !== productId);
  saveLocalProducts(updated);
  return true;
}

// ==========================================
// 1.1 PAPELERA DE PRODUCTOS (RECYCLE BIN)
// ==========================================

export function getLocalTrashedProducts(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_TRASH_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading trashed products from localStorage', e);
  }
  return [];
}

export function saveLocalTrashedProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_TRASH_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Error saving trashed products to localStorage', e);
  }
}

export async function fetchTrashedProducts(): Promise<Product[]> {
  try {
    const trashRef = collection(db, TRASH_PRODUCTS_COLLECTION);
    const snapshot = await getDocs(trashRef);
    if (!snapshot.empty) {
      const trashed: Product[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Product;
        trashed.push({ ...data, id: docSnap.id });
      });
      saveLocalTrashedProducts(trashed);
      return trashed;
    } else {
      return getLocalTrashedProducts();
    }
  } catch (err) {
    console.warn('Could not fetch trashed products from Firestore, falling back to local storage:', err);
    return getLocalTrashedProducts();
  }
}

/**
 * Move a product to the recycle bin (papelera) so it is hidden from customers
 * but can be restored at any time when new stock arrives.
 */
export async function trashProduct(
  productId: string, 
  reason?: string
): Promise<{ trashedProduct: Product; updatedProducts: Product[]; updatedTrash: Product[] }> {
  const currentProducts = getLocalProducts();
  const targetProduct = currentProducts.find(p => p.id === productId);

  if (!targetProduct) {
    throw new Error('El producto no fue encontrado en el catálogo.');
  }

  const trashedItem: Product = {
    ...targetProduct,
    isTrashed: true,
    deletedAt: new Date().toISOString(),
    trashReason: reason || 'Ocultado temporalmente por falta de disponibilidad'
  };

  // 1. Add to Trash collection in Firestore
  try {
    await setDoc(doc(db, TRASH_PRODUCTS_COLLECTION, trashedItem.id), trashedItem);
  } catch (err) {
    console.warn('Error writing trashed product to Firestore:', err);
  }

  // 2. Remove from active Products collection in Firestore
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn('Error removing product from Firestore products collection:', err);
  }

  // 3. Update local storage for active products
  const updatedProducts = currentProducts.filter(p => p.id !== productId);
  saveLocalProducts(updatedProducts);

  // 4. Update local storage for trash
  const currentTrash = getLocalTrashedProducts();
  const updatedTrash = [trashedItem, ...currentTrash.filter(t => t.id !== productId)];
  saveLocalTrashedProducts(updatedTrash);

  return {
    trashedProduct: trashedItem,
    updatedProducts,
    updatedTrash
  };
}

/**
 * Restore a product from the recycle bin back to the active catalog
 * so customers can view and purchase it again immediately.
 */
export async function restoreProduct(
  productId: string
): Promise<{ restoredProduct: Product; updatedProducts: Product[]; updatedTrash: Product[] }> {
  const currentTrash = getLocalTrashedProducts();
  const targetTrash = currentTrash.find(p => p.id === productId);

  if (!targetTrash) {
    throw new Error('El producto no fue encontrado en la papelera.');
  }

  const restoredItem: Product = {
    ...targetTrash,
    isTrashed: false,
    deletedAt: undefined,
    trashReason: undefined,
    inStock: targetTrash.stockCount !== undefined ? targetTrash.stockCount > 0 : true
  };

  // 1. Add back to Products collection in Firestore
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, restoredItem.id), restoredItem);
  } catch (err) {
    console.warn('Error saving restored product to Firestore:', err);
  }

  // 2. Remove from Trash collection in Firestore
  try {
    await deleteDoc(doc(db, TRASH_PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn('Error removing product from Firestore trash collection:', err);
  }

  // 3. Update active products in local storage
  const currentProducts = getLocalProducts();
  const updatedProducts = [restoredItem, ...currentProducts.filter(p => p.id !== productId)];
  saveLocalProducts(updatedProducts);

  // 4. Update trash in local storage
  const updatedTrash = currentTrash.filter(t => t.id !== productId);
  saveLocalTrashedProducts(updatedTrash);

  return {
    restoredProduct: restoredItem,
    updatedProducts,
    updatedTrash
  };
}

/**
 * Permanently delete a product from the recycle bin (cannot be recovered).
 */
export async function permanentlyDeleteProduct(productId: string): Promise<Product[]> {
  try {
    await deleteDoc(doc(db, TRASH_PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn('Error deleting from Firestore trash:', err);
  }

  const currentTrash = getLocalTrashedProducts();
  const updatedTrash = currentTrash.filter(p => p.id !== productId);
  saveLocalTrashedProducts(updatedTrash);
  return updatedTrash;
}

/**
 * Restore all products currently in the recycle bin.
 */
export async function restoreAllTrashed(): Promise<{ updatedProducts: Product[]; updatedTrash: Product[] }> {
  return restoreAllTrashedProducts();
}

export async function restoreAllTrashedProducts(): Promise<{ updatedProducts: Product[]; updatedTrash: Product[] }> {
  const currentTrash = getLocalTrashedProducts();
  const currentProducts = getLocalProducts();

  const restoredList: Product[] = [];
  for (const item of currentTrash) {
    const restored: Product = {
      ...item,
      isTrashed: false,
      deletedAt: undefined,
      trashReason: undefined,
      inStock: item.stockCount !== undefined ? item.stockCount > 0 : true
    };
    restoredList.push(restored);

    try {
      await setDoc(doc(db, PRODUCTS_COLLECTION, restored.id), restored);
      await deleteDoc(doc(db, TRASH_PRODUCTS_COLLECTION, item.id));
    } catch (e) {
      console.warn('Batch restore error in Firestore', e);
    }
  }

  const updatedProducts = [...restoredList, ...currentProducts.filter(p => !restoredList.some(r => r.id === p.id))];
  saveLocalProducts(updatedProducts);
  saveLocalTrashedProducts([]);

  return {
    updatedProducts,
    updatedTrash: []
  };
}

/**
 * Empty the entire recycle bin permanently.
 */
export async function emptyTrash(): Promise<void> {
  return emptyTrashedProducts();
}

export async function emptyTrashedProducts(): Promise<void> {
  const currentTrash = getLocalTrashedProducts();
  for (const item of currentTrash) {
    try {
      await deleteDoc(doc(db, TRASH_PRODUCTS_COLLECTION, item.id));
    } catch (e) {
      // ignore
    }
  }
  saveLocalTrashedProducts([]);
}

// Update specific size inventory for a product
export async function updateProductSizeInventory(
  productId: string, 
  size: string, 
  newQuantity: number
): Promise<Product | null> {
  const current = getLocalProducts();
  const index = current.findIndex(p => p.id === productId);
  if (index < 0) return null;

  const product = current[index];
  const sizeInv = { ...(product.sizeInventory || {}) };
  sizeInv[size] = Math.max(0, newQuantity);

  const totalStock = Object.values(sizeInv).reduce((acc, q) => acc + (Number(q) || 0), 0);
  const updatedProduct: Product = {
    ...product,
    sizeInventory: sizeInv,
    stockCount: totalStock,
    inStock: totalStock > 0
  };

  return await saveProduct(updatedProduct);
}

// ==========================================
// 2. CATEGORIES MANAGEMENT
// ==========================================

export function getLocalCategories(): Category[] {
  try {
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading categories from localStorage', e);
  }
  return INITIAL_CATEGORIES;
}

export function saveLocalCategories(categories: Category[]) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Error saving categories to localStorage', e);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const catRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(catRef);
    if (!snapshot.empty) {
      const cats: Category[] = [];
      snapshot.forEach(docSnap => {
        cats.push({ ...docSnap.data(), id: docSnap.id } as Category);
      });
      saveLocalCategories(cats);
      return cats;
    } else {
      console.log('Seeding initial categories to Firestore...');
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, c.id), c);
      }
      saveLocalCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
  } catch (err) {
    console.warn('Firestore categories error, falling back to local state:', err);
    return getLocalCategories();
  }
}

export async function saveCategory(category: Category): Promise<Category> {
  try {
    await setDoc(doc(db, CATEGORIES_COLLECTION, category.id), category, { merge: true });
  } catch (err) {
    console.warn('Firestore category write error:', err);
  }

  const current = getLocalCategories();
  const index = current.findIndex(c => c.id === category.id);
  let updated: Category[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = category;
  } else {
    updated = [...current, category];
  }
  saveLocalCategories(updated);
  return category;
}

export async function removeCategory(categoryId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (err) {
    console.warn('Firestore category delete error:', err);
  }

  const current = getLocalCategories();
  const updated = current.filter(c => c.id !== categoryId);
  saveLocalCategories(updated);
  return true;
}

// ==========================================
// 2.1 PAPELERA DE CATEGORÍAS (RECYCLE BIN)
// ==========================================

export function getLocalTrashedCategories(): Category[] {
  try {
    const saved = localStorage.getItem(LOCAL_TRASH_CATEGORIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading trashed categories from localStorage', e);
  }
  return [];
}

export function saveLocalTrashedCategories(categories: Category[]) {
  try {
    localStorage.setItem(LOCAL_TRASH_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Error saving trashed categories to localStorage', e);
  }
}

export async function fetchTrashedCategories(): Promise<Category[]> {
  try {
    const trashRef = collection(db, TRASH_CATEGORIES_COLLECTION);
    const snapshot = await getDocs(trashRef);
    if (!snapshot.empty) {
      const trashed: Category[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Category;
        trashed.push({ ...data, id: docSnap.id });
      });
      saveLocalTrashedCategories(trashed);
      return trashed;
    } else {
      return getLocalTrashedCategories();
    }
  } catch (err) {
    console.warn('Could not fetch trashed categories from Firestore, falling back to local storage:', err);
    return getLocalTrashedCategories();
  }
}

export async function trashCategory(
  categoryId: string, 
  reason?: string
): Promise<{ trashedCategory: Category; updatedCategories: Category[]; updatedTrash: Category[] }> {
  const currentCategories = getLocalCategories();
  const targetCategory = currentCategories.find(c => c.id === categoryId);

  if (!targetCategory) {
    throw new Error('La categoría no fue encontrada en el sistema.');
  }

  const trashedItem: Category = {
    ...targetCategory,
    isTrashed: true,
    deletedAt: new Date().toISOString(),
    trashReason: reason || 'Eliminada del catálogo'
  };

  // 1. Add to Trash collection in Firestore
  try {
    await setDoc(doc(db, TRASH_CATEGORIES_COLLECTION, trashedItem.id), trashedItem);
  } catch (err) {
    console.warn('Error writing trashed category to Firestore:', err);
  }

  // 2. Remove from active Categories collection in Firestore
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (err) {
    console.warn('Error removing category from Firestore categories collection:', err);
  }

  // 3. Update active categories in local storage
  const updatedCategories = currentCategories.filter(c => c.id !== categoryId);
  saveLocalCategories(updatedCategories);

  // 4. Update trash in local storage
  const currentTrash = getLocalTrashedCategories();
  const updatedTrash = [trashedItem, ...currentTrash.filter(t => t.id !== categoryId)];
  saveLocalTrashedCategories(updatedTrash);

  return {
    trashedCategory: trashedItem,
    updatedCategories,
    updatedTrash
  };
}

export async function restoreCategory(
  categoryId: string
): Promise<{ restoredCategory: Category; updatedCategories: Category[]; updatedTrash: Category[] }> {
  const currentTrash = getLocalTrashedCategories();
  const targetTrash = currentTrash.find(c => c.id === categoryId);

  if (!targetTrash) {
    throw new Error('La categoría no fue encontrada en la papelera.');
  }

  const restoredItem: Category = {
    ...targetTrash,
    isTrashed: false,
    deletedAt: undefined,
    trashReason: undefined
  };

  // 1. Add back to Categories collection in Firestore
  try {
    await setDoc(doc(db, CATEGORIES_COLLECTION, restoredItem.id), restoredItem);
  } catch (err) {
    console.warn('Error saving restored category to Firestore:', err);
  }

  // 2. Remove from Trash collection in Firestore
  try {
    await deleteDoc(doc(db, TRASH_CATEGORIES_COLLECTION, categoryId));
  } catch (err) {
    console.warn('Error removing category from Firestore trash collection:', err);
  }

  // 3. Update active categories in local storage
  const currentCategories = getLocalCategories();
  const updatedCategories = [...currentCategories.filter(c => c.id !== categoryId), restoredItem];
  saveLocalCategories(updatedCategories);

  // 4. Update trash in local storage
  const updatedTrash = currentTrash.filter(t => t.id !== categoryId);
  saveLocalTrashedCategories(updatedTrash);

  return {
    restoredCategory: restoredItem,
    updatedCategories,
    updatedTrash
  };
}

export async function permanentlyDeleteCategory(categoryId: string): Promise<Category[]> {
  try {
    await deleteDoc(doc(db, TRASH_CATEGORIES_COLLECTION, categoryId));
  } catch (err) {
    console.warn('Error deleting category from Firestore trash:', err);
  }

  const currentTrash = getLocalTrashedCategories();
  const updatedTrash = currentTrash.filter(c => c.id !== categoryId);
  saveLocalTrashedCategories(updatedTrash);
  return updatedTrash;
}

export async function restoreAllTrashedCategories(): Promise<{ updatedCategories: Category[]; updatedTrash: Category[] }> {
  const currentTrash = getLocalTrashedCategories();
  const currentCategories = getLocalCategories();

  const restoredList: Category[] = [];
  for (const item of currentTrash) {
    const restored: Category = {
      ...item,
      isTrashed: false,
      deletedAt: undefined,
      trashReason: undefined
    };
    restoredList.push(restored);

    try {
      await setDoc(doc(db, CATEGORIES_COLLECTION, restored.id), restored);
      await deleteDoc(doc(db, TRASH_CATEGORIES_COLLECTION, item.id));
    } catch (e) {
      console.warn('Batch restore category error in Firestore', e);
    }
  }

  const updatedCategories = [...restoredList, ...currentCategories.filter(c => !restoredList.some(r => r.id === c.id))];
  saveLocalCategories(updatedCategories);
  saveLocalTrashedCategories([]);

  return {
    updatedCategories,
    updatedTrash: []
  };
}

export async function emptyTrashedCategories(): Promise<void> {
  const currentTrash = getLocalTrashedCategories();
  for (const item of currentTrash) {
    try {
      await deleteDoc(doc(db, TRASH_CATEGORIES_COLLECTION, item.id));
    } catch (e) {
      // ignore
    }
  }
  saveLocalTrashedCategories([]);
}

// ==========================================
// 3. ORDERS MANAGEMENT
// ==========================================

export function getLocalOrders(): Order[] {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading orders from localStorage', e);
  }
  return INITIAL_ORDERS;
}

export function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Error saving orders to localStorage', e);
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);
    if (!snapshot.empty) {
      const ordersList: Order[] = [];
      snapshot.forEach(docSnap => {
        ordersList.push({ ...docSnap.data(), id: docSnap.id } as Order);
      });
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalOrders(ordersList);
      return ordersList;
    } else {
      console.log('Seeding initial orders to Firestore...');
      for (const o of INITIAL_ORDERS) {
        await setDoc(doc(db, ORDERS_COLLECTION, o.id), o);
      }
      saveLocalOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
  } catch (err) {
    console.warn('Firestore orders error, falling back to local state:', err);
    return getLocalOrders();
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  const orderWithTimestamp: Order = {
    ...order,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, orderWithTimestamp.id), orderWithTimestamp, { merge: true });
  } catch (err) {
    console.warn('Firestore order write error:', err);
  }

  const current = getLocalOrders();
  const index = current.findIndex(o => o.id === orderWithTimestamp.id);
  let updated: Order[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = orderWithTimestamp;
  } else {
    updated = [orderWithTimestamp, ...current];
  }
  saveLocalOrders(updated);
  return orderWithTimestamp;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<Order | null> {
  const current = getLocalOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index < 0) return null;

  const target = current[index];
  const updatedOrder: Order = {
    ...target,
    status,
    ...(trackingNumber ? { trackingNumber } : {}),
    updatedAt: new Date().toISOString()
  };

  return await saveOrder(updatedOrder);
}

export async function removeOrder(orderId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (err) {
    console.warn('Firestore order delete error:', err);
  }

  const current = getLocalOrders();
  const updated = current.filter(o => o.id !== orderId);
  saveLocalOrders(updated);
  return true;
}

// ==========================================
// 3.1 PAPELERA DE PEDIDOS (RECYCLE BIN)
// ==========================================

export function getLocalTrashedOrders(): Order[] {
  try {
    const saved = localStorage.getItem(LOCAL_TRASH_ORDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading trashed orders from localStorage', e);
  }
  return [];
}

export function saveLocalTrashedOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_TRASH_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Error saving trashed orders to localStorage', e);
  }
}

export async function fetchTrashedOrders(): Promise<Order[]> {
  try {
    const trashRef = collection(db, TRASH_ORDERS_COLLECTION);
    const snapshot = await getDocs(trashRef);
    if (!snapshot.empty) {
      const trashed: Order[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Order;
        trashed.push({ ...data, id: docSnap.id });
      });
      saveLocalTrashedOrders(trashed);
      return trashed;
    } else {
      return getLocalTrashedOrders();
    }
  } catch (err) {
    console.warn('Could not fetch trashed orders from Firestore, falling back to local storage:', err);
    return getLocalTrashedOrders();
  }
}

export async function trashOrder(
  orderId: string, 
  reason?: string
): Promise<{ trashedOrder: Order; updatedOrders: Order[]; updatedTrash: Order[] }> {
  const currentOrders = getLocalOrders();
  const targetOrder = currentOrders.find(o => o.id === orderId);

  if (!targetOrder) {
    throw new Error('El pedido no fue encontrado en el sistema.');
  }

  const trashedItem: Order = {
    ...targetOrder,
    isTrashed: true,
    deletedAt: new Date().toISOString(),
    trashReason: reason || 'Eliminado de la lista de pedidos'
  };

  // 1. Add to Trash collection in Firestore
  try {
    await setDoc(doc(db, TRASH_ORDERS_COLLECTION, trashedItem.id), trashedItem);
  } catch (err) {
    console.warn('Error writing trashed order to Firestore:', err);
  }

  // 2. Remove from active Orders collection in Firestore
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (err) {
    console.warn('Error removing order from Firestore orders collection:', err);
  }

  // 3. Update active orders in local storage
  const updatedOrders = currentOrders.filter(o => o.id !== orderId);
  saveLocalOrders(updatedOrders);

  // 4. Update trash in local storage
  const currentTrash = getLocalTrashedOrders();
  const updatedTrash = [trashedItem, ...currentTrash.filter(t => t.id !== orderId)];
  saveLocalTrashedOrders(updatedTrash);

  return {
    trashedOrder: trashedItem,
    updatedOrders,
    updatedTrash
  };
}

export async function restoreOrder(
  orderId: string
): Promise<{ restoredOrder: Order; updatedOrders: Order[]; updatedTrash: Order[] }> {
  const currentTrash = getLocalTrashedOrders();
  const targetTrash = currentTrash.find(o => o.id === orderId);

  if (!targetTrash) {
    throw new Error('El pedido no fue encontrado en la papelera.');
  }

  const restoredItem: Order = {
    ...targetTrash,
    isTrashed: false,
    deletedAt: undefined,
    trashReason: undefined
  };

  // 1. Add back to Orders collection in Firestore
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, restoredItem.id), restoredItem);
  } catch (err) {
    console.warn('Error saving restored order to Firestore:', err);
  }

  // 2. Remove from Trash collection in Firestore
  try {
    await deleteDoc(doc(db, TRASH_ORDERS_COLLECTION, orderId));
  } catch (err) {
    console.warn('Error removing order from Firestore trash collection:', err);
  }

  // 3. Update active orders in local storage
  const currentOrders = getLocalOrders();
  const updatedOrders = [restoredItem, ...currentOrders.filter(o => o.id !== orderId)];
  saveLocalOrders(updatedOrders);

  // 4. Update trash in local storage
  const updatedTrash = currentTrash.filter(t => t.id !== orderId);
  saveLocalTrashedOrders(updatedTrash);

  return {
    restoredOrder: restoredItem,
    updatedOrders,
    updatedTrash
  };
}

export async function permanentlyDeleteOrder(orderId: string): Promise<Order[]> {
  try {
    await deleteDoc(doc(db, TRASH_ORDERS_COLLECTION, orderId));
  } catch (err) {
    console.warn('Error deleting order from Firestore trash:', err);
  }

  const currentTrash = getLocalTrashedOrders();
  const updatedTrash = currentTrash.filter(o => o.id !== orderId);
  saveLocalTrashedOrders(updatedTrash);
  return updatedTrash;
}

export async function restoreAllTrashedOrders(): Promise<{ updatedOrders: Order[]; updatedTrash: Order[] }> {
  const currentTrash = getLocalTrashedOrders();
  const currentOrders = getLocalOrders();

  const restoredList: Order[] = [];
  for (const item of currentTrash) {
    const restored: Order = {
      ...item,
      isTrashed: false,
      deletedAt: undefined,
      trashReason: undefined
    };
    restoredList.push(restored);

    try {
      await setDoc(doc(db, ORDERS_COLLECTION, restored.id), restored);
      await deleteDoc(doc(db, TRASH_ORDERS_COLLECTION, item.id));
    } catch (e) {
      console.warn('Batch restore order error in Firestore', e);
    }
  }

  const updatedOrders = [...restoredList, ...currentOrders.filter(o => !restoredList.some(r => r.id === o.id))];
  saveLocalOrders(updatedOrders);
  saveLocalTrashedOrders([]);

  return {
    updatedOrders,
    updatedTrash: []
  };
}

export async function emptyTrashedOrders(): Promise<void> {
  const currentTrash = getLocalTrashedOrders();
  for (const item of currentTrash) {
    try {
      await deleteDoc(doc(db, TRASH_ORDERS_COLLECTION, item.id));
    } catch (e) {
      // ignore
    }
  }
  saveLocalTrashedOrders([]);
}

// ==========================================
// 4. CUSTOMERS DIRECTORY
// ==========================================

export function extractCustomersFromOrders(orders: Order[]): Customer[] {
  const customerMap = new Map<string, Customer>();

  orders.forEach(order => {
    // Unique key: phone or email or name
    const key = (order.customerPhone || order.customerEmail || order.customerName).trim().toLowerCase();
    if (!key) return;

    const existing = customerMap.get(key);
    const orderDate = order.createdAt;

    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpentCRC += order.totalCRC;
      if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = orderDate;
      }
      if (new Date(orderDate) < new Date(existing.firstOrderDate)) {
        existing.firstOrderDate = orderDate;
      }
      if (!existing.email && order.customerEmail) {
        existing.email = order.customerEmail;
      }
    } else {
      customerMap.set(key, {
        id: 'cust-' + Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || '',
        province: order.province,
        canton: order.canton,
        ordersCount: 1,
        totalSpentCRC: order.totalCRC,
        firstOrderDate: orderDate,
        lastOrderDate: orderDate
      });
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => b.totalSpentCRC - a.totalSpentCRC);
}

// ==========================================
// 5. STORE SETTINGS MANAGEMENT
// ==========================================

export function getLocalStoreSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return { ...STORE_SETTINGS_DEFAULT, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading store settings from localStorage', e);
  }
  return STORE_SETTINGS_DEFAULT;
}

export function saveLocalStoreSettings(settings: StoreSettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving store settings to localStorage', e);
  }
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StoreSettings;
      const combined = { ...STORE_SETTINGS_DEFAULT, ...data };
      saveLocalStoreSettings(combined);
      return combined;
    } else {
      console.log('Seeding initial store settings to Firestore...');
      await setDoc(docRef, STORE_SETTINGS_DEFAULT);
      saveLocalStoreSettings(STORE_SETTINGS_DEFAULT);
      return STORE_SETTINGS_DEFAULT;
    }
  } catch (err) {
    console.warn('Firestore settings read error, using local fallback:', err);
    return getLocalStoreSettings();
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.warn('Firestore settings save error:', err);
  }

  saveLocalStoreSettings(settings);
  return settings;
}

// ==========================================
// 6. TIKTOK VIDEOS MANAGEMENT
// ==========================================

export function getLocalTikToks(): TikTokVideo[] {
  try {
    const saved = localStorage.getItem(LOCAL_TIKTOK_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading tiktoks from localStorage', e);
  }
  return INITIAL_TIKTOK_VIDEOS;
}

export function saveLocalTikToks(videos: TikTokVideo[]) {
  try {
    localStorage.setItem(LOCAL_TIKTOK_KEY, JSON.stringify(videos));
  } catch (e) {
    console.warn('Error saving tiktoks to localStorage', e);
  }
}

export async function fetchTikTokVideos(): Promise<TikTokVideo[]> {
  try {
    const tiktokRef = collection(db, TIKTOK_COLLECTION);
    const snapshot = await getDocs(tiktokRef);
    if (!snapshot.empty) {
      const videos: TikTokVideo[] = [];
      snapshot.forEach(docSnap => {
        videos.push({ ...docSnap.data(), id: docSnap.id } as TikTokVideo);
      });
      saveLocalTikToks(videos);
      return videos;
    } else {
      for (const v of INITIAL_TIKTOK_VIDEOS) {
        await setDoc(doc(db, TIKTOK_COLLECTION, v.id), v);
      }
      saveLocalTikToks(INITIAL_TIKTOK_VIDEOS);
      return INITIAL_TIKTOK_VIDEOS;
    }
  } catch (err) {
    console.warn('Could not fetch tiktoks from Firestore, falling back to local state:', err);
    return getLocalTikToks();
  }
}

export async function saveTikTokVideo(video: TikTokVideo): Promise<TikTokVideo> {
  try {
    await setDoc(doc(db, TIKTOK_COLLECTION, video.id), video, { merge: true });
  } catch (err) {
    console.warn('Firestore tiktok write error, falling back to localStorage:', err);
  }

  const current = getLocalTikToks();
  const index = current.findIndex(v => v.id === video.id);
  let updated: TikTokVideo[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = video;
  } else {
    updated = [video, ...current];
  }
  saveLocalTikToks(updated);
  return video;
}

export async function removeTikTokVideo(videoId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, TIKTOK_COLLECTION, videoId));
  } catch (err) {
    console.warn('Firestore delete error, falling back to localStorage:', err);
  }

  const current = getLocalTikToks();
  const updated = current.filter(v => v.id !== videoId);
  saveLocalTikToks(updated);
  return true;
}

// ==========================================
// 6.1 PAPELERA DE TIKTOKS (RECYCLE BIN)
// ==========================================

export function getLocalTrashedTikToks(): TikTokVideo[] {
  try {
    const saved = localStorage.getItem(LOCAL_TRASH_TIKTOK_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading trashed tiktoks from localStorage', e);
  }
  return [];
}

export function saveLocalTrashedTikToks(videos: TikTokVideo[]) {
  try {
    localStorage.setItem(LOCAL_TRASH_TIKTOK_KEY, JSON.stringify(videos));
  } catch (e) {
    console.warn('Error saving trashed tiktoks to localStorage', e);
  }
}

export async function fetchTrashedTikToks(): Promise<TikTokVideo[]> {
  try {
    const trashRef = collection(db, TRASH_TIKTOK_COLLECTION);
    const snapshot = await getDocs(trashRef);
    if (!snapshot.empty) {
      const trashed: TikTokVideo[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TikTokVideo;
        trashed.push({ ...data, id: docSnap.id });
      });
      saveLocalTrashedTikToks(trashed);
      return trashed;
    } else {
      return getLocalTrashedTikToks();
    }
  } catch (err) {
    console.warn('Could not fetch trashed tiktoks from Firestore, falling back to local storage:', err);
    return getLocalTrashedTikToks();
  }
}

export async function trashTikTokVideo(
  videoId: string, 
  reason?: string
): Promise<{ trashedTikTok: TikTokVideo; updatedTikToks: TikTokVideo[]; updatedTrash: TikTokVideo[] }> {
  const currentTikToks = getLocalTikToks();
  const targetTikTok = currentTikToks.find(v => v.id === videoId);

  if (!targetTikTok) {
    throw new Error('El video no fue encontrado en el sistema.');
  }

  const trashedItem: TikTokVideo = {
    ...targetTikTok,
    isTrashed: true,
    deletedAt: new Date().toISOString(),
    trashReason: reason || 'Eliminado de la lista de videos destacados'
  };

  // 1. Add to Trash collection in Firestore
  try {
    await setDoc(doc(db, TRASH_TIKTOK_COLLECTION, trashedItem.id), trashedItem);
  } catch (err) {
    console.warn('Error writing trashed tiktok to Firestore:', err);
  }

  // 2. Remove from active TikTok collection in Firestore
  try {
    await deleteDoc(doc(db, TIKTOK_COLLECTION, videoId));
  } catch (err) {
    console.warn('Error removing tiktok from Firestore collection:', err);
  }

  // 3. Update active tiktoks in local storage
  const updatedTikToks = currentTikToks.filter(v => v.id !== videoId);
  saveLocalTikToks(updatedTikToks);

  // 4. Update trash in local storage
  const currentTrash = getLocalTrashedTikToks();
  const updatedTrash = [trashedItem, ...currentTrash.filter(t => t.id !== videoId)];
  saveLocalTrashedTikToks(updatedTrash);

  return {
    trashedTikTok: trashedItem,
    updatedTikToks,
    updatedTrash
  };
}

export async function restoreTikTokVideo(
  videoId: string
): Promise<{ restoredTikTok: TikTokVideo; updatedTikToks: TikTokVideo[]; updatedTrash: TikTokVideo[] }> {
  const currentTrash = getLocalTrashedTikToks();
  const targetTrash = currentTrash.find(v => v.id === videoId);

  if (!targetTrash) {
    throw new Error('El video no fue encontrado en la papelera.');
  }

  const restoredItem: TikTokVideo = {
    ...targetTrash,
    isTrashed: false,
    deletedAt: undefined,
    trashReason: undefined
  };

  // 1. Add back to TikToks collection in Firestore
  try {
    await setDoc(doc(db, TIKTOK_COLLECTION, restoredItem.id), restoredItem);
  } catch (err) {
    console.warn('Error saving restored tiktok to Firestore:', err);
  }

  // 2. Remove from Trash collection in Firestore
  try {
    await deleteDoc(doc(db, TRASH_TIKTOK_COLLECTION, videoId));
  } catch (err) {
    console.warn('Error removing tiktok from Firestore trash collection:', err);
  }

  // 3. Update active tiktoks in local storage
  const currentTikToks = getLocalTikToks();
  const updatedTikToks = [...currentTikToks.filter(v => v.id !== videoId), restoredItem];
  saveLocalTikToks(updatedTikToks);

  // 4. Update trash in local storage
  const updatedTrash = currentTrash.filter(t => t.id !== videoId);
  saveLocalTrashedTikToks(updatedTrash);

  return {
    restoredTikTok: restoredItem,
    updatedTikToks,
    updatedTrash
  };
}

export async function permanentlyDeleteTikTokVideo(videoId: string): Promise<TikTokVideo[]> {
  try {
    await deleteDoc(doc(db, TRASH_TIKTOK_COLLECTION, videoId));
  } catch (err) {
    console.warn('Error deleting tiktok from Firestore trash:', err);
  }

  const currentTrash = getLocalTrashedTikToks();
  const updatedTrash = currentTrash.filter(t => t.id !== videoId);
  saveLocalTrashedTikToks(updatedTrash);
  return updatedTrash;
}

export async function restoreAllTrashedTikToks(): Promise<{ updatedTikToks: TikTokVideo[]; updatedTrash: TikTokVideo[] }> {
  const currentTrash = getLocalTrashedTikToks();
  const currentTikToks = getLocalTikToks();

  const restoredList: TikTokVideo[] = [];
  for (const item of currentTrash) {
    const restored: TikTokVideo = {
      ...item,
      isTrashed: false,
      deletedAt: undefined,
      trashReason: undefined
    };
    restoredList.push(restored);

    try {
      await setDoc(doc(db, TIKTOK_COLLECTION, restored.id), restored);
      await deleteDoc(doc(db, TRASH_TIKTOK_COLLECTION, item.id));
    } catch (e) {
      console.warn('Batch restore tiktok error in Firestore', e);
    }
  }

  const updatedTikToks = [...restoredList, ...currentTikToks.filter(v => !restoredList.some(r => r.id === v.id))];
  saveLocalTikToks(updatedTikToks);
  saveLocalTrashedTikToks([]);

  return {
    updatedTikToks,
    updatedTrash: []
  };
}

export async function emptyTrashedTikToks(): Promise<void> {
  const currentTrash = getLocalTrashedTikToks();
  for (const item of currentTrash) {
    try {
      await deleteDoc(doc(db, TRASH_TIKTOK_COLLECTION, item.id));
    } catch (e) {
      // ignore
    }
  }
  saveLocalTrashedTikToks([]);
}

// ==========================================
// 7. EXCEL / CSV EXPORTERS & DOWNLOAD HELPERS
// ==========================================

export function downloadCSV(content: string, filename: string) {
  // Add UTF-8 BOM so Excel and Google Sheets open Spanish characters (tildes, ñ, ₡) perfectly
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Inventory to clean, organized Excel CSV (essential info only)
export function exportInventoryToExcel(products: Product[]): string {
  const headers = [
    'Código',
    'Producto',
    'Marca',
    'Categoría',
    'Precio Unitario (CRC)',
    'Desglose por Talla',
    'Stock Total',
    'Estado',
    'Valor Total (CRC)'
  ];

  const rows: string[][] = [];

  products.forEach((p, idx) => {
    const code = p.id.length > 8 ? `LS-${p.id.slice(-4).toUpperCase()}` : p.id.toUpperCase();
    
    // Clean size summary: e.g. "S: 2 | M: 4 | L: 2"
    let sizeBreakdown = '';
    let totalStock = 0;

    if (p.sizeInventory && Object.keys(p.sizeInventory).length > 0) {
      const parts: string[] = [];
      Object.entries(p.sizeInventory).forEach(([size, qty]) => {
        const count = Number(qty) || 0;
        totalStock += count;
        parts.push(`${size}: ${count}`);
      });
      sizeBreakdown = parts.join(' | ');
    } else {
      totalStock = p.stockCount || 0;
      sizeBreakdown = p.sizes.map(s => `${s}: ${Math.max(1, Math.round(totalStock / (p.sizes.length || 1)))}`).join(' | ');
    }

    const totalValue = totalStock * (p.priceCRC || 0);

    rows.push([
      `"${code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category.toUpperCase()}"`,
      String(p.priceCRC || 0),
      `"${sizeBreakdown}"`,
      String(totalStock),
      totalStock > 0 ? 'En Stock' : 'Agotado',
      String(totalValue)
    ]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export Orders to clean, organized Excel CSV (essential info only)
export function exportOrdersToExcel(orders: Order[]): string {
  const headers = [
    'Nº Pedido',
    'Fecha',
    'Cliente',
    'Teléfono WhatsApp',
    'Destino / Ubicación',
    'Artículos Comprados',
    'Total (CRC)',
    'Método de Pago',
    'Estado'
  ];

  const rows: string[][] = [];

  orders.forEach((o, index) => {
    // Clean, readable Order ID (e.g. #ORD-01 or clean code)
    const orderNum = o.id.startsWith('order-') 
      ? `#LS-${o.id.slice(-4).toUpperCase()}` 
      : `#LS-${String(index + 1).padStart(3, '0')}`;

    // Clean Date: DD/MM/AAAA HH:mm
    const dateObj = o.createdAt ? new Date(o.createdAt) : new Date();
    const formattedDate = dateObj.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Concise items summary: e.g. "Camiseta Boxy (M) x1 | Gorra NY x1"
    const cleanItems = o.items
      .map(i => `${i.productName} [Talla ${i.size}] x${i.quantity}`)
      .join(' | ');

    // Clean destination summary: "El Roble, Puntarenas" or "San José, Escazú"
    const locationParts = [o.canton, o.province].filter(Boolean);
    const destination = locationParts.length > 0 ? locationParts.join(', ') : (o.province || 'Puntarenas');

    rows.push([
      `"${orderNum}"`,
      `"${formattedDate}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${destination.replace(/"/g, '""')}"`,
      `"${cleanItems.replace(/"/g, '""')}"`,
      String(o.totalCRC || 0),
      `"${o.paymentMethod || 'SINPE Móvil'}"`,
      `"${o.status || 'Pendiente'}"`
    ]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export Customers to clean, organized Excel CSV
export function exportCustomersToExcel(customers: Customer[]): string {
  const headers = [
    'Cliente',
    'Teléfono WhatsApp',
    'Ubicación',
    'Total Pedidos',
    'Total Invertido (CRC)',
    'Última Compra'
  ];

  const rows: string[][] = [];

  customers.forEach(c => {
    const location = [c.canton, c.province].filter(Boolean).join(', ') || 'Puntarenas';
    const lastDate = c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('es-CR') : 'Reciente';

    rows.push([
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${location.replace(/"/g, '""')}"`,
      String(c.ordersCount || 1),
      String(c.totalSpentCRC || 0),
      `"${lastDate}"`
    ]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export Catalog to Shopify CSV format
export function exportProductsToShopifyCSV(products: Product[]): string {
  const headers = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Product Category',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Variant SKU',
    'Variant Grams',
    'Variant Inventory Tracker',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Image Src',
    'Image Position',
    'Image Alt Text',
    'Status'
  ];

  const rows: string[][] = [];

  products.forEach(p => {
    const handle = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bodyHtml = `<p>${p.description}</p><ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>`;
    const tags = [p.brand, p.category, p.tag || '', p.isFeatured ? 'Featured' : '', p.isViral ? 'Viral TikTok' : ''].filter(Boolean).join(', ');

    // For each size variant
    const sizes = p.sizes.length > 0 ? p.sizes : ['Única'];
    sizes.forEach((size, idx) => {
      const stock = (p.sizeInventory && p.sizeInventory[size] !== undefined)
        ? p.sizeInventory[size]
        : Math.round((p.stockCount || 10) / sizes.length);

      rows.push([
        handle,
        idx === 0 ? `"${p.name.replace(/"/g, '""')}"` : '',
        idx === 0 ? `"${bodyHtml.replace(/"/g, '""')}"` : '',
        idx === 0 ? `"${p.brand}"` : '',
        idx === 0 ? 'Apparel & Accessories' : '',
        idx === 0 ? p.category : '',
        idx === 0 ? `"${tags}"` : '',
        'TRUE',
        'Size',
        size,
        `${p.id}-${size}`,
        '400',
        'shopify',
        String(stock),
        'deny',
        'manual',
        String(p.priceCRC),
        p.originalPriceCRC ? String(p.originalPriceCRC) : '',
        'TRUE',
        'TRUE',
        idx === 0 ? (p.image.startsWith('/') ? window.location.origin + p.image : p.image) : '',
        idx === 0 ? '1' : '',
        idx === 0 ? `"${p.name}"` : '',
        p.inStock ? 'active' : 'draft'
      ]);
    });
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
