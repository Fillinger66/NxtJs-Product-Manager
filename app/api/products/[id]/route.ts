import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";
import { ProductManager } from "@/lib/db/DbManager";
import { ProductData } from "@/lib/types/types";
import { AlreadyExistError, NotFoundError } from "@/lib/types/ErrorType";
/**
 * Gets a product by ID, with an option to include related mark and category information.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the product ID.
 * @returns A JSON response containing the product data.
 */
export async function GET (request : NextRequest, {params} : {params : Promise<{id : string}>}){

    const paramsData = await params;
    console.log("Params data:", paramsData);

    let fullProduct = request.nextUrl.searchParams.get("fullProduct");
    if(!fullProduct) {
        console.log("Not including mark and category");
        fullProduct = "false";
    }
   

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }    

    try {

        const product = await ProductManager.getProductById(Number(paramsData.id), fullProduct === "true" ? true : false);

        console.log("Product:", product);

        return NextResponse.json( ApiResponseBuilder.success(product), { status: 200 });
    }
    catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        console.error("Error fetching products:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
/**
 * Deletes a product by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the product ID.
 * @returns A JSON response indicating the result of the deletion.
 */
export async function DELETE(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }
    try {
     
        const deletedProduct = await ProductManager.deleteProduct(Number(paramsData.id));

        console.log("Deleted product:", deletedProduct);

        return NextResponse.json(ApiResponseBuilder.success(deletedProduct), { status: 200 });

    }catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message ), { status: 404 });
        }
        console.error("Error deleting product:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
/**
 * Updates a product by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the product ID.
 * @returns A JSON response containing the updated product data.
 */
export async function PUT(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const body = await request.json();
        console.log("Request body:", body)
        if(!body.name || !body.categoryId || !body.markId) {
            return NextResponse.json(ApiResponseBuilder.error("Bad request. Missing required fields."), { status: 400 });
        }

        const productData : ProductData = {
            name: body.name,
            description: body.description? body.description : null,
            price: body.price? body.price : null,
            stock: body.stock? body.stock : null,
            categoryId: body.categoryId,
            markId: body.markId
        };
        const updatedProduct = await ProductManager.updateProduct(Number(paramsData.id), productData);

        console.log("Updated product:", updatedProduct);
        return NextResponse.json(ApiResponseBuilder.success(updatedProduct), { status: 200 });


    }catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        else if (error instanceof AlreadyExistError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        console.error("Error fetching products:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}