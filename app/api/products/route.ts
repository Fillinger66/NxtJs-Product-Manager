import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

export async function GET (request : NextRequest,response : NextResponse) {

    try {

        const prisma = new PrismaClient();


        const products = await prisma.product.findMany();
        console.log("products:", products);
        return NextResponse.json( products, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }



}

