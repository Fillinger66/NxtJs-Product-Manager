import { NextRequest, NextResponse } from "next/server";

import { PrismaClient, PrismaClientExtends } from "@prisma/client";

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

        const prisma = new PrismaClient();
        const mark = await prisma.mark.findUnique({
            where : {id: Number(paramsData.id)},
            include: {
                products: includeProducts === "true" ? true : false
            }
        });
        if (mark === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }
        console.log("marks:", mark);
        return NextResponse.json(  mark, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching marks:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


export async function DELETE(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Mark ID is required" }, { status: 400 });
    }

    try {
        const prisma = new PrismaClient();

        const existingMark = await prisma.mark.findUnique({
            where: { id: Number(paramsData.id) },
            include: { products: true }
        });
        
        if (!existingMark) {
            return NextResponse.json({ message: "Mark not found." }, { status: 404 });
        }
        else if (existingMark.products && existingMark.products.length > 0) {
            return NextResponse.json({ message: "Cannot delete mark with associated products." }, { status: 400 });
        }

        const deletedMark = await prisma.mark.delete({
            where : {id: Number(paramsData.id)}
        });
       
        console.log("Deleted mark:", deletedMark);
        await prisma.$disconnect();
        return NextResponse.json({ message: "Mark deleted successfully", data : deletedMark }, { status: 200 });
        
    }catch(error) {
        console.error("Error deleting mark:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;
    console.log("Params data:", paramsData);

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    try {
        const prisma = new PrismaClient();

        const existingMark = await prisma.mark.findUnique({
            where : {id : Number(paramsData.id)}
        });
        if (existingMark === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }
        const body = await request.json();
        console.log("Request body:", body); 

        const updatedMark = await prisma.mark.update({
            where : { id : Number(paramsData.id)},
            data: {
                name: body.name,
            }
        });
        console.log("Updated mark:", updatedMark);
        await prisma.$disconnect();
        return NextResponse.json(updatedMark, { status: 200 });
    }catch(error) {
        console.error("Error updating mark:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
