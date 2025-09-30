import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateAdvert } from "@/lib/ai/AdvertGenAI";
import { ProductDto } from "@/lib/dto/ProductDto";
import { ApiResponseBuilder } from "@/lib/types/ApiResponseType";
import { ProductManager } from "@/lib/db/DbManager";
/**
 * Handles the GET request for generating an advertisement for a specific product.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the product ID.
 * @returns A JSON response containing the generated advertisement.
 */
export async function GET (request : NextRequest, {params} : {params : Promise<{id : string}>}){

    const paramsData = await params;
    console.log("Params data:", paramsData);

    let format = request.nextUrl.searchParams.get("format");
    if(!format) {
        console.log("Defaulting to text format");
        format = "text";
    }
   
    if (!paramsData.id) {
        return NextResponse.json(ApiResponseBuilder.error( "Bad request" ), { status: 400 });
    }    

    try {
        let productDto : ProductDto;
        const prisma = new PrismaClient();
        const products = await ProductManager.getProductById(Number(paramsData.id), true);
        if(products === null) {
            return NextResponse.json(ApiResponseBuilder.error("resource not found"), {status: 404} );
        }

        const mark = await prisma.mark.findUnique({
            where: { id: products.markId }
        });
        
        const category = await prisma.category.findUnique({
            where: { id:  products.categoryId  }
        });
        

        productDto = new ProductDto(products, mark ? mark : undefined, category ? category : undefined);

        console.log("productsDto:", productDto);

        const advert = await generateAdvert(productDto, format);

        console.log("Generated advert:", advert);
        
        return NextResponse.json(ApiResponseBuilder.success(advert), { status: 200 });
    }
    catch(error) {
        console.error("Error generating advertisment:", error);
        return NextResponse.json(ApiResponseBuilder.error("Internal Server Error" ), { status: 500 });
    }
}