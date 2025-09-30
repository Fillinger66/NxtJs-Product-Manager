import { Prisma, Product, Mark, Category } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/binary";

/**
 * Data Transfer Object for Product
 */
export class ProductDto {

    title: string;
    description: string
    price: number;
    stock: number;
    mark: {
        name: string;
    };
    category:{
        name: string;
    }

    /**
     * Constructs a ProductDto from Prisma model objects.
     * @param product The Product object from Prisma.
     * @param mark The associated Mark object from Prisma.
     * @param category The associated Category object from Prisma.
     */
    constructor(product:Product, mark? : Mark, category?: Category) {
        this.title = product.name;
        this.description = product.description ? product.description : "No description available";
        this.price = Decimal(product.price ? product.price : 0).toNumber();
        this.stock = product.stock ? product.stock : 0;
        this.mark = { name: mark ? mark.name : "Unknown" };
        this.category = { name: category ? category.name : "Uncategorized" };
    }

    /**
     * Sets the Mark object.
     * @param mark The Mark object to set.
     */
    setMark(mark: Mark) {
        if (!mark) {
            throw new Error("Invalid mark");
        }
        if (mark.name &&mark.name.trim() === "") {
            throw new Error("Mark name cannot be empty");
        }
        
        this.mark = { name: mark.name };
    }
    /**
     * Sets the Category object.
     * @param category The Category object to set.
     */
    setCategory(category: Category) {
        if (!category) {
            throw new Error("Invalid category");
        }
        if (category.name && category.name.trim() === "") {
            throw new Error("Category name cannot be empty");
        }

        this.category = { name: category.name };
    }
}
