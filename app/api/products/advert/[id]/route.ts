import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import { promptAdvertGeneration} from "@/lib/AdvertGenAI";

export async function GET (request : NextRequest, {params} : {params : Promise<{id : string}>}){

    const paramsData = await params;
    console.log("Params data:", paramsData);

   
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

        const mark = await prisma.mark.findUnique({
            where: { id: products.markId }
        });
        (products as any).mark = mark;



        const category = await prisma.category.findUnique({
            where: { id:  products.categoryId  }
        });
        (products as any).category = category;
 
        console.log("products:", products);

        const advert = await promptAdvertGeneration(products, "html");

        return NextResponse.json( { advert }, { status: 200 });
    }
    catch(error) {
        console.error("Error generating advertisment:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}