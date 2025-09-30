import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { Decimal } from "@prisma/client/runtime/library";

import { PrismaClient } from "@prisma/client";


/**
 * Data structure representing the expected CSV data format
 */
type csv_data = {
    Product: string,
    Mark: string,
    Category: string
    Description: string,
    Price: Decimal,
    Stock: number
}
/**
 * Handles the POST request for uploading a CSV file.
 * @param request - The incoming request object.
 * @param response - The response object to send back.
 * @returns A JSON response indicating the result of the upload.
 */
export async function POST(request : NextRequest,response : NextResponse) {

    const formData = await request.formData();
    const file = formData.get('csv') as File;
    
    
    if(!file) {
        return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const csvText = await file.text();
    const parsedData = await  new Promise<csv_data[]>((resolve, reject) => {
      
        Papa.parse<csv_data>(csvText, {
            header: true,
            delimiter: ",",
            skipEmptyLines: true,
            complete: (results) => {
                console.log("parsing finishhed");
                resolve(results.data);
            },
            error: (error: any) => {
                console.error("Error parsing CSV:", error);
                reject(error);
            }
        });
    });

    console.log("parsed data:", parsedData);

    const prisma = new PrismaClient();

    for (const item of parsedData) {
            console.log("Processing item:", item);
            // Upsert category
            const category = await prisma.category.upsert({
                where :{ name: item.Category },
                update: {},
                create: { name: item.Category }


            });
            console.log("inserted category:", category);

            // Upsert mark  
            const mark = await prisma.mark.upsert({
                where : { name: item.Mark },
                update: {},
                create: { name: item.Mark }
            });
            console.log("inserted mark:", mark);

            // Check if product exists first, then create or update
            // We need to check manually because upsert requires a unique field
            const existingProduct = await prisma.product.findFirst({
                where: { 
                    name: item.Product,
                    // You might also want to check by category and mark to avoid duplicates
                    categoryId: category.id,
                    markId: mark.id
                }
            });
            let product;
            if (existingProduct) {
                // Update existing product
                product = await prisma.product.update({
                    where: { id: existingProduct.id },
                    data: {
                        description: item.Description,
                        price: new Decimal(item.Price.toString()),
                        stock: item.Stock,
                        categoryId: category.id,
                        markId: mark.id
                    }
                });
            } else {
                // Create new product
                product = await prisma.product.create({
                    data: {
                        name: item.Product,
                        description: item.Description,
                        price: new Decimal(item.Price.toString()),
                        stock: Number(item.Stock),
                        categoryId: Number(category.id),
                        markId: Number(mark.id)
                    }
                });
            }
        await prisma.$disconnect();
        console.log("inserted product : ", product);
        console.log("------------------------------------------")

    }

    console.log(file)
    return NextResponse.json({ message: "File uploaded successfully" });
}
