import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/binary";

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

export async function DELETE(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }
    try {
        const prisma = new PrismaClient();
        const existingProduct = await prisma.product.findUnique({
            where : {id : Number(paramsData.id)}
        });

        if (existingProduct === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }
        const deletedProduct = await prisma.product.delete({
            where : {id: Number(paramsData.id)}
        }); 

        console.log("Deleted product:", deletedProduct);
        await prisma.$disconnect();
        return NextResponse.json({ message: "Product deleted successfully", data : deletedProduct }, { status: 200 });

    }catch(error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const paramsData = await params;

    if (!paramsData.id) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const prisma = new PrismaClient();
        const existingProduct = await prisma.product.findUnique({
            where : {id : Number(paramsData.id)}
        });
        if (existingProduct === null){
            return NextResponse.json({"message": "resource not found"}, {status: 404} );
        }

        const body = await request.json();
        console.log("Request body:", body);

        const mark = body.markId ? await prisma.mark.findUnique({ where: { id: body.markId } }) : null;
        const category = body.categoryId ? await prisma.category.findUnique({ where: { id: body.categoryId } }) : null;

        if(mark === null || category === null) {
            return NextResponse.json({ message: "Invalid markId or categoryId." }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where : { id : Number(paramsData.id)},
            data: {
                name: body.name != existingProduct.name ? body.name : existingProduct.name,
                description: body.description != existingProduct.description ? body.description : existingProduct.description,
                price: body.price != null ?  (body.price!= existingProduct.price ? new Decimal(body.price.toString()) : existingProduct.price) : existingProduct.price,
                stock: body.stock != null ? (body.stock != existingProduct.stock ? Number(body.stock) : existingProduct.stock) : existingProduct.stock,
                categoryId: category.id != existingProduct.categoryId ? Number(category.id) : existingProduct.categoryId,
                markId: mark.id != existingProduct.markId ? Number(mark.id) : existingProduct.markId
            }
        });

        console.log("Updated product:", updatedProduct);
        await prisma.$disconnect();
        return NextResponse.json(updatedProduct, { status: 200 });


    }catch(error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}