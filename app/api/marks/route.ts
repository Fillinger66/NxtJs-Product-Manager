import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

export async function GET (request : NextRequest) {

   
    try {

        const prisma = new PrismaClient();
        const mark = await prisma.mark.findMany({
            include: {
                products: false
            }
        });
        console.log("marks:", mark);
        return NextResponse.json(  mark, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching marks:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

