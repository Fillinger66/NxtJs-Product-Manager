import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

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

