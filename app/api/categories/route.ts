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