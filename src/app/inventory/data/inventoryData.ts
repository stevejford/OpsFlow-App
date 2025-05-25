// Sample inventory data for garage door parts
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  price: number;
  deliveryCost?: number;
  stock: number;
  sku: string;
  description: string;
  weight?: number;
  image?: string;
}

export const inventoryData: InventoryItem[] = [
  { id: 1, name: "Torsion Spring 25x2", category: "springs", costPrice: 65.50, retailPrice: 99.99, price: 89.99, deliveryCost: 12.50, stock: 45, sku: "TS-25x2", description: "Heavy duty torsion spring for residential garage doors", weight: 8.5 },
  { id: 2, name: "Garage Door Opener Remote", category: "openers", costPrice: 18.75, retailPrice: 34.99, price: 29.99, deliveryCost: 5.00, stock: 120, sku: "GDO-REM", description: "Universal garage door opener remote control", weight: 0.3 },
  { id: 3, name: "Steel Track Set", category: "tracks", costPrice: 110.25, retailPrice: 179.99, price: 159.99, deliveryCost: 25.00, stock: 8, sku: "ST-SET", description: "Complete steel track system for standard garage doors", weight: 22.5 },
  { id: 4, name: "Extension Spring", category: "springs", costPrice: 16.50, retailPrice: 29.99, price: 24.99, deliveryCost: 8.00, stock: 67, sku: "ES-STD", description: "Standard extension spring for garage door systems", weight: 4.2 },
  { id: 5, name: "Roller Assembly", category: "hardware", costPrice: 7.85, retailPrice: 14.99, price: 12.99, deliveryCost: 3.50, stock: 234, sku: "RA-STD", description: "Standard roller assembly with ball bearings", weight: 1.1 },
  { id: 6, name: "Sectional Panel", category: "panels", costPrice: 225.00, retailPrice: 349.99, price: 299.99, deliveryCost: 45.00, stock: 0, sku: "SP-18x7", description: "18x7 sectional garage door panel - white", weight: 85.0 },
  { id: 7, name: "Cable and Pulley Kit", category: "cables", costPrice: 32.75, retailPrice: 52.99, price: 45.99, deliveryCost: 7.50, stock: 89, sku: "CPK-STD", description: "Complete cable and pulley kit for extension spring doors", weight: 3.8 },
  { id: 8, name: "Weather Stripping", category: "hardware", costPrice: 12.25, retailPrice: 22.99, price: 18.99, deliveryCost: 4.00, stock: 156, sku: "WS-20FT", description: "20ft weather stripping for garage door bottom", weight: 2.5 },
  { id: 9, name: "Chain Drive Opener", category: "openers", costPrice: 135.50, retailPrice: 209.99, price: 189.99, deliveryCost: 30.00, stock: 23, sku: "CDO-1HP", description: "1HP chain drive garage door opener with remote", weight: 18.7 },
  { id: 10, name: "Hinges Set", category: "hardware", costPrice: 24.50, retailPrice: 39.99, price: 34.99, deliveryCost: 6.00, stock: 78, sku: "HS-SET", description: "Complete hinge set for sectional garage doors", weight: 4.5 },
  { id: 11, name: "Belt Drive Opener", category: "openers", costPrice: 185.25, retailPrice: 279.99, price: 249.99, deliveryCost: 35.00, stock: 15, sku: "BDO-3/4HP", description: "3/4HP belt drive garage door opener - quiet operation", weight: 16.8 },
  { id: 12, name: "Lift Cable", category: "cables", costPrice: 19.75, retailPrice: 32.99, price: 28.99, deliveryCost: 5.50, stock: 92, sku: "LC-9FT", description: "9ft lift cable for garage door systems", weight: 1.2 }
];

export const categories = [
  { id: "springs", name: "Springs", icon: "tools" },
  { id: "openers", name: "Openers", icon: "cog" },
  { id: "hardware", name: "Hardware", icon: "wrench" },
  { id: "tracks", name: "Tracks", icon: "minus" },
  { id: "panels", name: "Panels", icon: "square" },
  { id: "cables", name: "Cables", icon: "link" }
];

export interface FilterItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  type: 'stock' | 'price' | 'custom';
}

export const stockFilters: FilterItem[] = [
  { id: "low", name: "Low Stock", icon: "exclamation-triangle", color: "#f59e0b", type: 'stock' },
  { id: "out", name: "Out of Stock", icon: "times-circle", color: "#ef4444", type: 'stock' }
];

export const priceFilters: FilterItem[] = [
  { id: "under50", name: "Under $50", icon: "dollar-sign", color: "#10b981", type: 'price' },
  { id: "over100", name: "Over $100", icon: "chart-line", color: "#3b82f6", type: 'price' }
];

export const customFilters: FilterItem[] = [
  { id: "new", name: "New Arrivals", icon: "star", color: "#8b5cf6", type: 'custom' },
  { id: "featured", name: "Featured Products", icon: "fire", color: "#f97316", type: 'custom' }
];

export const getAllFilters = (): FilterItem[] => {
  return [...stockFilters, ...priceFilters, ...customFilters];
};

export const getStockStatus = (stock: number): "out-of-stock" | "low-stock" | "in-stock" => {
  if (stock === 0) return "out-of-stock";
  if (stock < 10) return "low-stock";
  return "in-stock";
};

export const getStockLabel = (stock: number): string => {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
};
