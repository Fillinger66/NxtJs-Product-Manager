import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/binary";

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
export async function POST(request : NextRequest) {

    try {
        const prisma = new PrismaClient();
        const body = await request.json();
        console.log("Request body:", body);
        if(!body.name || !body.price || !body.categoryId || !body.markId) {
            return NextResponse.json({ message: "Bad request. Missing required fields." }, { status: 400 });
        }
        const mark = await prisma.mark.findUnique({ where: { id: body.markId } });
        const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
        if (!mark || !category) {
            return NextResponse.json({ message: "Invalid markId or categoryId." }, { status: 400 });
        }
        const existingProduct = await prisma.product.findFirst({
            where: { name: body.name }
        });
        if (existingProduct) {
            return NextResponse.json({ message: "Product with this name already exists." }, { status: 400 });
        }
        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: new Decimal(body.price.toString()),
                stock: body.stock != null ? Number(body.stock) : 0,
                categoryId: Number(category.id),
                markId: Number(mark.id)
            }
        });
        console.log("Created new product:", newProduct);
        await prisma.$disconnect();
        return NextResponse.json(newProduct, { status: 201 });
    }catch(error){
        console.error("Error creating product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

