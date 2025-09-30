import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/binary";
import { ProductManager } from "@/lib/db/DbManager";
import { ProductData } from "@/lib/types/types";
import { AlreadyExistError, NotFoundError } from "@/lib/types/ErrorType";
/**
 * Handles the GET request for fetching all products.
 * @param request - The incoming request object.
 * @param response - The response object to send back.
 * @returns A JSON response containing the list of products.
 */
export async function GET (request : NextRequest,response : NextResponse) {

    try {
        const products = await ProductManager.getAllProducts();
        console.log("products:", products);
        return NextResponse.json( products, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }



}
/**
 * Handles the POST request for creating a new product.
 * @param request - The incoming request object.
 * @returns A JSON response containing the created product data.
 */
export async function POST(request : NextRequest) {

    try {
        const prisma = new PrismaClient();
        const body = await request.json();
        console.log("Request body:", body);
        if(!body.name || !body.price || !body.categoryId || !body.markId) {
            return NextResponse.json({ message: "Bad request. Missing required fields." }, { status: 400 });
        }
       
        const productData : ProductData = {
            name: body.name,
            description: body.description || "",
            price: body.price,
            stock: body.stock || 0,
            categoryId: body.categoryId,
            markId: body.markId
        };
        const newProduct = await ProductManager.createProduct(productData);
        console.log("Product created:", newProduct);
        return NextResponse.json(newProduct, { status: 201 });

    }catch(error){
        if(error instanceof AlreadyExistError) {
            return NextResponse.json({ message: error.message }, { status: 409 });
        }
        else if (error instanceof NotFoundError) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        console.error("Error creating product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

