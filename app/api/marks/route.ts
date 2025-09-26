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

export async function POST(request : NextRequest) {

    try {
        const prisma = new PrismaClient();
        const body = await request.json();

        if(!body.name) {
            return NextResponse.json({ message: "Bad request. Missing required fields." }, { status: 400 });
        }
        const existingMark = await prisma.mark.findUnique({
            where: { name: body.name }
        });
        if (existingMark) {
            return NextResponse.json({ message: "Mark already exists." }, { status: 400 });
        }
        const newMark = await prisma.mark.create({
            data: {
                name: body.name
            }
        });
        console.log("Created new mark:", newMark);
        await prisma.$disconnect();
        return NextResponse.json(newMark, { status: 201 });
    
    }catch(error){
        console.error("Error creating mark:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
