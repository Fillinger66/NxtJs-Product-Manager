import { NextRequest, NextResponse } from "next/server";
import { MarkManager } from "@/lib/db/DbManager";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";
import { AlreadyExistError, ConflictError } from "@/lib/types/ErrorType";
/**
 * Gets all marks.
 * @param request - The incoming request object.
 * @returns A JSON response containing the list of marks.
 */
export async function GET (request : NextRequest) {
    try {

        const marks = await MarkManager.getAllMarks();
        console.log("marks:", marks);
        return NextResponse.json(  ApiResponseBuilder.success(marks), { status: 200 });
    }
    catch(error) {
        console.error("Error fetching marks:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
/**
 * Creates a new mark.
 * @param request - The incoming request object.
 * @returns A JSON response containing the created mark data.
 */
export async function POST(request : NextRequest) {

    try {
        
        const body = await request.json();

        if(!body.name) {
            return NextResponse.json(ApiResponseBuilder.error("Bad request. Missing required fields."), { status: 400 });
        }

        const newMark = await MarkManager.createMark(body.name);
        return NextResponse.json(ApiResponseBuilder.success(newMark), { status: 201 });
    
    }catch(error){
        console.error("Error creating mark:", error);
        if (error instanceof AlreadyExistError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        if (error instanceof ConflictError) {
            return NextResponse.json(ApiResponseBuilder.error(error.message), { status: 409 });
        }
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error"), { status: 500 });
    }
}
