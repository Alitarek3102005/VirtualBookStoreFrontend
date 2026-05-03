import { Cart } from "./cart";

export interface CartItem {
    id: number
    bookId: number
    quantity: number;
    price: number;
    cart: Cart;
}
