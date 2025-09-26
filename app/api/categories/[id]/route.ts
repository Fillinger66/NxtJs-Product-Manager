import { NextRequest,NextResponse } from "next/server";
import { PrismaClient} from "@prisma/client";
import { ErrorResponse, SuccessResponse } from "@/lib/types";

export async function GET(request : NextRequest, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);

    let ApiResponse: SuccessResponse<any> | ErrorResponse;

    if (!paramsData.id) {
        ApiResponse = {
            errorCode: -1,
            message: "Bad request"
        };
        return NextResponse.json(ApiResponse, { status: 400 });
    }

    let includeProducts = request.nextUrl.searchParams.get("includeProducts");
    if(!includeProducts) {
        console.log("Not including products");
        includeProducts = "false";
    }

    try {
        const prisma = new PrismaClient();

        const categories = await prisma.category.findUnique({
            where : {id : Number(paramsData.id)},
            include: {
                products: includeProducts === "true" ? true : false
            }
        });

        if(categories === null) {
             ApiResponse = {
                errorCode: -3,
                message: "Internal Server Error"
            };
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }

        console.log("categories:", categories);
        await prisma.$disconnect();

        return NextResponse.json(categories, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching categories:", error);
        ApiResponse = {
            errorCode: -2,
            message: "Internal Server Error"
        };
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request : NextResponse, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const prisma = new PrismaClient();
        const existingCategory = await prisma.category.findUnique({
            where : {id : Number(paramsData.id)}
        });
        if (existingCategory === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }
        const body = await request.json();
        console.log("Request body:", body);

        const updatedCategory = await prisma.category.update({
            where : { id : Number(paramsData.id)},
            data: {
                name: body.name,
            }
        });

        console.log("Updated category:", updatedCategory);
        await prisma.$disconnect();

        return NextResponse.json(updatedCategory, { status: 200 });
    }catch(error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}

export async function DELETE(request : NextResponse, {params} : {params: Promise<{id: string}>}) {

    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {

        const prisma = new PrismaClient();

        const existingCategory = await prisma.category.findUnique({
            where : {id : Number(paramsData.id)},
            include : { products : true }
        });

        if (existingCategory === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }
        else if (existingCategory.products && existingCategory.products.length > 0) {
            return NextResponse.json({ message: "Cannot delete category with associated products." }, { status: 400 });
        }
        
        const deletedCategory = await prisma.category.delete({
            where: { id: Number(paramsData.id) }
        });

        console.log("Deleted category:", deletedCategory);
        await prisma.$disconnect();

        return NextResponse.json({ message: "Category deleted successfully", "data": deletedCategory }, { status: 200 });

    } catch(error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}