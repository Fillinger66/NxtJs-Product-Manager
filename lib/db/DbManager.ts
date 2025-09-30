import { PrismaClient,Product,Category,Mark } from "@prisma/client";
import { error } from "console";
import { Decimal } from "@prisma/client/runtime/binary";
import { NotFoundError,AlreadyExistError, ConflictError, BadRequestError } from "../types/ErrorType";
import { get } from "http";
import { ProductData, FullProduct } from "../types/types";

/**
 * Database Manager for handling Product
 * Includes methods for CRUD operations and data retrieval
 */
export class ProductManager{

    /**
     * Get product by ID with option for full details(including category and mark) 
     * @param id  Product ID
     * @param fullProduct  Whether to include full product details
     * @returns  Product or FullProduct object
     */
    static async getProductById(id: number, fullProduct: boolean) : Promise<Product | FullProduct| null> {

        const prisma = new PrismaClient();
        const product = await prisma.product.findUnique(
        {
            where: { id: id }
        });
        await prisma.$disconnect();

        if (!product) {
            throw new NotFoundError("Product not found.");
        }

        if (!fullProduct) {
           
            return product;
        }
        else {
            let fullProduct : FullProduct;

            const category = await prisma.category.findUnique({
                where: { id: product.categoryId }
            });
            const mark = await prisma.mark.findUnique({
                where: { id: product.markId }
            });
            fullProduct = { ...product, category: category, mark: mark };
            return fullProduct;
        }     
        
    }
    /**
     * Get all products with related mark and category ids
     * @returns List of all products
     */
    static async getAllProducts() : Promise<Product[]> {

        const prisma = new PrismaClient();
        const products = await prisma.product.findMany();
        await prisma.$disconnect();
        return products;
    }
    /**
     * Get product by name
     * @param name Product name
     * @returns Product or null if not found
     */
    static async getProductByName(name: string) : Promise<Product | null> {
        const prisma = new PrismaClient();
        const product = await prisma.product.findUnique(
            {
                where : {name : name}
            }
        );
        await prisma.$disconnect();
        return product;
    }
    /**
     * Create a new product
     * @param productData Data for creating a new product
     * @returns Created product
     */
    static async createProduct(productData: ProductData) : Promise<Product> {

        const prisma = new PrismaClient();
        if(!productData.name || !productData.price || !productData.categoryId || !productData.markId) {
            throw new BadRequestError("Bad request. Missing required fields.");
        }
        const existingMark = await MarkManager.getMarkById(productData.markId, false);
        const existingCategory = await CategoryManager.getCategoryById(productData.categoryId, false);
        if (!existingMark || !existingCategory) {
            throw new BadRequestError("Invalid mark or category.");
        }
        const existingProduct = await this.getProductByName(productData.name);
        if (existingProduct) {
            throw new AlreadyExistError("Product with this name already exists.");
        }
        const newProduct = await prisma.product.create({
            data: {
                name: productData.name,
                description: productData.description,
                price: new Decimal(productData.price.toString()),
                stock: productData.stock != null ? Number(productData.stock) : 0,
                markId: productData.markId ,
                categoryId: productData.categoryId 
            }
        });
        await prisma.$disconnect();
        return newProduct;
    }
    /**
     * Delete a product by ID
     * @param id Product ID to delete
     * @returns Deleted product
     */
    static async deleteProduct(id: number) : Promise<Product> {

        const prisma = new PrismaClient();
        const existingProduct = await prisma.product.findUnique({
            where: { id: Number(id) }
        });
        if (!existingProduct) {
            throw new NotFoundError("Product not found.");
        }
        const deletedProduct = await prisma.product.delete({
            where: { id: Number(id) }
        });
        await prisma.$disconnect();
        return deletedProduct;
    }
    /**
     * Update a product by ID
     * @param id Product ID to update
     * @param productData Data to update the product
     * @returns Updated product
     */
    static async updateProduct(id: number, productData: ProductData) : Promise<Product>  {

        const prisma = new PrismaClient();
        const existingProduct = await this.getProductById(id,false);

        if (existingProduct === null){
           throw new NotFoundError("resource not found");
        }
        else if (productData.name && productData.name !== existingProduct.name) {
            const productWithSameName = await this.getProductByName(productData.name);
            if (productWithSameName) {
                throw new AlreadyExistError("Product with this name already exists.");
            }
        }
        if(productData.markId) {
            const existingMark = await MarkManager.getMarkById(productData.markId, false);
            if (!existingMark) {
                throw new NotFoundError("Mark not found.");
            }
        }
        if(productData.categoryId) {
            const existingCategory = await CategoryManager.getCategoryById(productData.categoryId, false);
            if (!existingCategory) {
                throw new NotFoundError("Category not found.");
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                name: productData.name,
                description: productData.description ? productData.description : existingProduct.description,
                price: productData.price ? new Decimal(productData.price.toString()) : existingProduct.price,
                stock: productData.stock != null ? Number(productData.stock) : 0,
                markId: productData.markId,
                categoryId: productData.categoryId
            }
        });

        await prisma.$disconnect();
        return updatedProduct;
    }
}
/**
 * Database Manager for handling Category
 * Includes methods for CRUD operations and data retrieval
 */
export class CategoryManager{

    /**
     * Get category by ID with option to include related products
     * @param id Category ID
     * @param includeProducts Whether to include related products
     * @returns Category or null if not found
     */
    static async getCategoryById(id: number, includeProducts: boolean) : Promise<Category | null> {

        const prisma = new PrismaClient();
        const category = await prisma.category.findUnique(
            {
                where : {id : id},
                include: {
                    products: includeProducts
                }
            }
        );
        await prisma.$disconnect();
        return category;
    }
    /**
     * Get category by name
     * @param name Category name
     * @returns Category or null if not found
     */
    static async getCategoryByName(name: string) : Promise<Category | null> {

        const prisma = new PrismaClient();
        const category = await prisma.category.findUnique(
            {
                where : {name : name}
            }
        );
        return category;
    }
    /**
     * Get all categories without related products
     * @returns List of all categories
     */
    static async getAllCategories() : Promise<Category[]> {

        const prisma = new PrismaClient();
        const categories = await prisma.category.findMany({
            include: {
                products: false
            }
        });
        await prisma.$disconnect();
        return categories;
    }
    /**
     * Get all categories with related products
     * @returns List of all categories with products
     */
    static async getAllCategoriesWithProducts() : Promise<Category[]> {

        const prisma = new PrismaClient();
        const categories = await prisma.category.findMany({
            include: {
                products: true
            }
        });
        await prisma.$disconnect();
        return categories;
    }
    /**
     * Create a new category
     * @param name Name of the new category
     * @returns Created category
     */
    static async createCategory(name: string) : Promise<Category> {

        const prisma = new PrismaClient();
        const existingCategory = await prisma.category.findUnique({
            where: { name: name }
        });

        if (existingCategory) {
            throw new AlreadyExistError("Category already exists.");
        }

        const newCategory = await prisma.category.create({
            data: {
                name: name
            }
        });

        console.log("Created new category:", newCategory);
        await prisma.$disconnect();

        return newCategory;
    }
    /**
     * Update a category by ID
     * @param id Category ID to update
     * @param name New name for the category
     * @return Updated category
     */
    static async updateCategory(id: number, name: string) : Promise<Category>  {
    
        const prisma = new PrismaClient();

        const existingCategory = await this.getCategoryById(id, false);
        if (existingCategory === null){
           throw new NotFoundError("resource not found");
        }
       
        const categoryWithSameName = await this.getCategoryByName(name);
        if (categoryWithSameName){
            throw new AlreadyExistError("Category already exists.");
        }

        const updatedCategory = await prisma.category.update({
            where : { id : Number(id)},
            data: {
                name: name,
            }
        });

        console.log("Updated category:", updatedCategory);
        await prisma.$disconnect();

        return updatedCategory;
    
    } 

    /**
     * Delete a category by ID
     * @param id Category ID to delete
     * @returns Deleted category
     */
    static async deleteCategory(id: number) : Promise<Category> {

        const prisma = new PrismaClient();
        
        const existingCategory = await prisma.category.findUnique({
            where : {id : Number(id)},
            include : { products : true }
        });

        if (existingCategory === null){
            throw new NotFoundError("resource not found");
        }
        else if (existingCategory.products && existingCategory.products.length > 0) {
            throw new ConflictError("Cannot delete category with associated products.");
        }
        
        const deletedCategory = await prisma.category.delete({
            where: { id: Number(id) }
        });

        console.log("Deleted category:", deletedCategory);
        await prisma.$disconnect();

        return  deletedCategory;
        
    }
}
/** Database Manager for handling Mark
 * Includes methods for CRUD operations and data retrieval
 */
export class MarkManager
{
    /**
     * Get mark by ID with option to include related products
     * @param id Mark ID
     * @param includeProducts Whether to include related products
     * @returns Mark or null if not found
     */
    static async getMarkById(id: number, includeProducts: boolean) : Promise<Mark | null> {
        const prisma = new PrismaClient();
        const mark = await prisma.mark.findUnique(
            {
                where : {id : id},
                include: {
                    products: includeProducts
                }
            }
        );
        return mark;
    }
    /**
     * Get all marks without related products
     * @returns List of all marks
     */
    static async getAllMarks() : Promise<Mark[]> {
        const prisma = new PrismaClient();
        const marks = await prisma.mark.findMany({
            include: {
                products: false
            }
        });
        await prisma.$disconnect();
        return marks;
    }
    /**
     * delete a mark by ID
     * @param id Mark ID to delete
     * @returns Deleted mark
     */
    static async deleteMark(id: number) : Promise<Mark> {

        const prisma = new PrismaClient();
        
        const existingMark = await prisma.mark.findUnique({
            where: { id: Number(id) },
            include: { products: true }
        });
        
        if (!existingMark) {
            throw new NotFoundError("Mark not found.");
        }
        
        else if (existingMark.products && existingMark.products.length > 0) {
            throw new ConflictError("Cannot delete mark with associated products.");
        }

        const deletedMark = await prisma.mark.delete({
            where : {id: Number(id)}
        });
        
        console.log("Deleted mark:", deletedMark);
        await prisma.$disconnect();
        return deletedMark;
    }
    /**
     * Update a mark by ID
     * @param id Mark ID to update
     * @param name New name for the mark
     * @return Updated mark
     */
    static async updateMark(id: number, name : string) : Promise<Mark>  {
        const prisma = new PrismaClient();
        
        const existingMark = await prisma.mark.findUnique({
            where : {id : Number(id)}
        });

        if (existingMark === null){
            throw new NotFoundError("resource not found");
        }

        const existingMarkWithSameName = await prisma.mark.findUnique({
            where : {name : name}
        });

        if (existingMarkWithSameName){
            throw new AlreadyExistError("Mark already exists.");
        }

        const updatedMark = await prisma.mark.update({
            where : { id : Number(id)},
            data: {
                name: name,
            }
        });

        console.log("Updated mark:", updatedMark);
        await prisma.$disconnect();

        return updatedMark;
    }
    /**
     * Create a new mark
     * @param name Name of the new mark
     * @returns Created mark
     */
    static async createMark(name: string) : Promise<Mark> {
        const prisma = new PrismaClient();

        if(!name) {
            throw new BadRequestError("Bad request. Missing required fields.");
        }
       
        const existingMark = await this.getMarkByName(name);

        if (existingMark) {
            throw new AlreadyExistError("Mark already exists.");
        }
      
        const newMark = await prisma.mark.create({
            data: {
                name: name
            }
        });
        console.log("Created new mark:", newMark);
        await prisma.$disconnect();

        return newMark;
    }
    /**
     * Get mark by name
     * @param name Mark name
     * @returns Mark or null if not found
     */
    static async getMarkByName(name: string) : Promise<Mark | null> {
        const prisma = new PrismaClient();
        const mark = await prisma.mark.findUnique(
            {
                where : {name : name}
            }
        );
        await prisma.$disconnect();
        return mark;
    }
}