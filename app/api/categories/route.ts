import { NextRequest,NextResponse } from "next/server";
import { PrismaClient} from "@prisma/client";


export async function GET(request : NextRequest) {
    try {
        const prisma = new PrismaClient();


        const categories = await prisma.category.findMany({
            include: {
                products: false
            }
        });
        console.log("categories:", categories);
        return NextResponse.json(categories, { status: 200 });
    }
    catch(error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}

export async function POST(request : NextRequest) {

    try {
        const prisma = new PrismaClient();
        const body = await request.json();

        if(!body.name) {
            return NextResponse.json({ message: "Bad request. Missing required fields." }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({
            where: { name: body.name }
        });

        if (existingCategory) {
            return NextResponse.json({ message: "Category already exists." }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: {
                name: body.name
            }
        });

        console.log("Created new category:", newCategory);
        await prisma.$disconnect();
        return NextResponse.json(newCategory, { status: 201 });

    }catch(error){
        console.error("Error creating category:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}