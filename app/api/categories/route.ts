import { NextRequest,NextResponse } from "next/server";
import { PrismaClient} from "@prisma/client";
import { CategoryManager } from "@/lib/db/DbManager";
import { AlreadyExistError } from "@/lib/types/ErrorType";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";

/**
 * Gets all categories.
 * @param request - The incoming request object.
 * @returns A JSON response containing the list of categories.
 */
export async function GET(request : NextRequest) {
    try {
        const categories = await CategoryManager.getAllCategories();
        console.log("categories:", categories);
        return NextResponse.json(ApiResponseBuilder.success(categories), { status: 200 } );
    }
    catch(error) {

        console.error("Error fetching categories:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), {status:500});
    }

}
/**
 * Creates a new category.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the category ID.
 * @returns A JSON response containing the created category data.
 */
export async function POST(request : NextRequest) {

    try {
        const prisma = new PrismaClient();
        const body = await request.json();

        if(!body.name) {
            return NextResponse.json({ message: "Bad request. Missing required fields." }, { status: 400 });
        }

        const newCategory = await CategoryManager.createCategory(body.name);

        console.log("Created new category:", newCategory);
        await prisma.$disconnect();
        return NextResponse.json(ApiResponseBuilder.success(newCategory), { status: 201 });

    }catch(error){
        console.error("Error creating category:", error);
        if (error instanceof AlreadyExistError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }

        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }

}