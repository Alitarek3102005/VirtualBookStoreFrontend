import { OrderItem } from "./order-item";

export interface Order {
  id: number;
  readerId: number;
  cartId: number | null;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}