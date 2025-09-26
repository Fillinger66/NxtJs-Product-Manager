import { google } from '@ai-sdk/google';
import { generateText } from 'ai';



export async function promptAdvertGeneration(prodcutData: any, responseType: string) {
  let prompt = `
    You are a world-class advertising copywriter specializing in direct-response marketing. Your task is to generate a highly persuasive and professional advertisement copy based on the provided product data and marketing context.

    **OBJECTIVE:**
    Create an engaging advertisement that drives immediate interest and action.

    **AUDIENCE PROFILE (CRITICAL INPUT):**
    - Target Audience: tech-savvy personnel, professionals, and enthusiasts looking for high-quality tech products.
    - Primary Pain Point/Need: What problem does this product solve for the audience or what the product will fulfill for them.

    **TONE & STYLE (CRITICAL INPUT):**
    - Tone: Professional , Friendly and conversational
    - Call-to-Action (CTA) Goal: Click to buy now

    **ADVERTISEMENT STRUCTURE & FORMAT:**
    1.  **Headline/Catch:** Start with a bold, attention-grabbing headline (maximum 10 words) focused on the main benefit.
    2.  **Introduction:** A short, engaging paragraph that speaks directly to the audience's pain point.
    3.  **Core Features & Benefits:** Use a concise bulleted list (max 4-5 points) to present features and translate them into direct benefits for the user.
    4.  **Closing:** A powerful, persuasive final sentence that creates urgency.
    5.  **Call to Action:** Include the specified Call-to-Action.

    **PRODUCT DATA:**
    - Name: ${prodcutData.title}
    - Description: ${prodcutData.description}
    - Price: ${prodcutData.price} €
    - Brand: ${prodcutData.mark.name}
    - Product category: ${prodcutData.category.name}

    **CONSTRAINT & OUTPUT RULES:**
    - The advertisement must be **under 150 words total**.
    - All content must be directly relevant to the provided data.
    - Do not include any introductory text, preambles, or explanations (e.g., "Here is your ad...").
    - Output only the final, formatted advertisement text.
    - **DO NOT** use Markdown, bullet points, numbered lists, or any special characters (including '\n', '\r', '\t', or '-' for lists) that would normally create line breaks or formatting. The text must flow continuously.
    ${responseType === "html" ? "format the advertisement using HTML tags (e.g., <h1> for headlines, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis). Don't add <body>, <html>, or <head> tags." : ""}
    `

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