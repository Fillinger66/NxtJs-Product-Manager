import { google } from '@ai-sdk/google';
import { generateText } from 'ai';



export async function promptAdvertGeneration(prodcutData: any, responseType: "text" | "html" = "text") {
  var prompt = `
    You are a world-class tech product seller and marketer. Write a beautiful, engaging, and professional-sounding advertisement based on the following data. 
    Start with a catchy introduction to entice the reader. Then, present the features and benefits clearly. 
    Do not output JSON, just the final formatted text. Avoid putting \n,\r,\t in the text.

    Here is the product data:
    - Name: ${prodcutData.title}
    - Description: ${prodcutData.description}
    - Price: ${prodcutData.price} €
    - Brand: ${prodcutData.mark.name}
    - Product category: ${prodcutData.category.name}
    ${responseType === "html" ? " Use HTML tags like <h1>, <h2>, <p>, <ul>, <ol>, <li> to format the content appropriately without any surrounding HTML, HEAD or BODY tags." : ""}
  `;

    const geminiModel = google('gemini-2.5-flash')

    const result = await generateText({
      model: geminiModel,
      prompt: prompt,
    });

    if (result && result.text) {
        return { success: true, data: { text: result.text } };
    }
    else {
        return { success: false, error: "Error generating text" };
    }
}