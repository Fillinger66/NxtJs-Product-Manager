import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

export async function GET (request : NextRequest, {params} : {params : Promise<{id : string}>}){

    const paramsData = await params;
    console.log("Params data:", paramsData);

    let includeMark = request.nextUrl.searchParams.get("includeMark");
    if(!includeMark) {
        console.log("Not including marks");
        includeMark = "false";
    }
    let includeCategory = request.nextUrl.searchParams.get("includeCategory");
    if(!includeCategory) {
        console.log("Not including categories");
        includeCategory = "false";
    }

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }    

    try {

        const prisma = new PrismaClient();
        const products = await prisma.product.findUnique(
            {
                where : {id : Number(paramsData.id)}
            }
        );
        if(products === null) {
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }

        if (includeMark === "true") {
            const mark = await prisma.mark.findUnique({
                where: { id: products.markId }
            });
            (products as any).mark = mark;
        }

        if (includeCategory === "true") {
            const categories = await prisma.category.findUnique({
                where: { id:  products.categoryId  }
            });
            (products as any).categories = categories;
        }

        console.log("products:", products);
        return NextResponse.json( products, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }



}