import { NextRequest, NextResponse } from "next/server";
import { MarkManager } from "@/lib/db/DbManager";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";
import { AlreadyExistError, ConflictError, NotFoundError } from "@/lib/types/ErrorType";
/**
 * Gets a mark by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the mark ID.
 * @returns A JSON response containing the mark data.
 */
export async function GET (request : NextRequest,{ params }: { params: Promise<{ id: string }> }) {

    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Mark ID is required" }, { status: 400 });
    }

    let includeProducts = request.nextUrl.searchParams.get("includeProducts");
    if(!includeProducts) {
        console.log("Not including products");
        includeProducts = "false";
    }
   
    try {

        const mark = await MarkManager.getMarkById(Number(paramsData.id), includeProducts === "true" ? true : false);
        if(mark === null) {
            return NextResponse.json(ApiResponseBuilder.error("mark not found."), { status: 404 });
        }
        console.log("marks:", mark);
        return NextResponse.json(  ApiResponseBuilder.success(mark), { status: 200 });
    }
    catch(error) {
        console.error("Error fetching marks:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}

/**
 * Deletes a mark by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the mark ID.
 * @returns A JSON response indicating the result of the deletion.
 */
export async function DELETE(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json(ApiResponseBuilder.error("Mark ID is required"), { status: 400 });
    }

    try {
        const deletedMark = await MarkManager.deleteMark(Number(paramsData.id));
        if(deletedMark === null) {
            return NextResponse.json(ApiResponseBuilder.error("Mark not found."), { status: 404 });
        }
        console.log("Deleted mark:", deletedMark);
        return NextResponse.json(ApiResponseBuilder.success(deletedMark), { status: 200 });
        
    }catch(error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        if (error instanceof ConflictError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 400 });
        }
        console.error("Error deleting mark:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
/**
 * Updates a mark by ID.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the mark ID.
 * @returns A JSON response containing the updated mark data.
 */
export async function PUT(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    try {
        const body = await request.json();
        if(!body.name) {
            return NextResponse.json(ApiResponseBuilder.error("Bad request. Missing required fields."), { status: 400 });
        }
        const updatedMark = await MarkManager.updateMark(Number(paramsData.id), body.name);
        console.log("Updated mark:", updatedMark);
        return NextResponse.json(ApiResponseBuilder.success(updatedMark), { status: 200 });

    }catch(error) {
        if( error instanceof NotFoundError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 404 });
        }
        else if (error instanceof AlreadyExistError ) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        console.log ("type of error:", typeof(error));
        console.error("Error updating mark:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
