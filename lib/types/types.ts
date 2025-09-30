
import { PrismaClient,Product,Category,Mark } from "@prisma/client";

/**
 * Data structure representing product data for creation
 */
interface ProductData {
    name: string;
    description: string;
    price: number;
    markId: number;
    categoryId: number;
    stock: number;
}
/**
 * Extended Product interface including related Category and Mark
 */
interface FullProduct extends Product {
    category?: Category | null;
    mark?: Mark | null;
}



export type { ProductData, FullProduct };