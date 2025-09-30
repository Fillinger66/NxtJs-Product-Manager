import { NextRequest,NextResponse } from "next/server";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";
import { CategoryManager } from "@/lib/db/DbManager";
import { AlreadyExistError, ConflictError, NotFoundError } from "@/lib/types/ErrorType";
/**
 * Gets a category by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the category ID.
 * @returns A JSON response containing the category data.
 */
export async function GET(request : NextRequest, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
       
        return NextResponse.json(ApiResponseBuilder.error("Missing request parameters"), { status: 400 });
    }

    let includeProducts = request.nextUrl.searchParams.get("includeProducts");
    if(!includeProducts) {
        console.log("Not including products");
        includeProducts = "false";
    }

    try {

        const categories  = await CategoryManager.getCategoryById(Number(paramsData.id), includeProducts === "true" ? true : false);
        if(categories === null) {
            return NextResponse.json(ApiResponseBuilder.error("Resource not found"), {status: 404} );
        }

        console.log("categories:", categories);

        return NextResponse.json(ApiResponseBuilder.success(categories), { status: 200 });
    }
    catch(error) {
        console.error("Error fetching categories:", error);

        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
/**
 * Updates a category by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the category ID.
 * @returns A JSON response containing the updated category data.
 */
export async function PUT(request : NextResponse, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);
    const body = await request.json();
    console.log("Request body:", body)

    if (!paramsData.id || !body.name) {
        return NextResponse.json(ApiResponseBuilder.error("Bad request"), { status: 400 });
    }

    try {

        const updatedCategory = await CategoryManager.updateCategory(Number(paramsData.id), body.name);
        console.log("Updated category:", updatedCategory);
        return NextResponse.json(ApiResponseBuilder.success(updatedCategory), { status: 200 });

    }catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        else if (error instanceof AlreadyExistError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        console.error("Error fetching categories:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }

}
/**
 * Delete a category by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the category ID.
 * @returns A JSON response indicating the result of the deletion.
 */
export async function DELETE(request : NextResponse, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
        return NextResponse.json(ApiResponseBuilder.error("Missing request parameters"), { status: 400 });
    }

    try {

        const deletedCategory = await CategoryManager.deleteCategory(Number(paramsData.id));
        console.log("Deleted category:", deletedCategory);
        return NextResponse.json(ApiResponseBuilder.success(deletedCategory), { status: 200 });
   
    } catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        else if (error instanceof ConflictError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        console.error("Error deleting category:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}