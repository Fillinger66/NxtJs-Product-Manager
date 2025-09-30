import { ProductDto } from "../dto/ProductDto";
import { google, } from '@ai-sdk/google';
import { generateText,LanguageModel } from 'ai';
/**
 * Class responsible for generating advertisements using AI models.
 * It constructs prompts based on product data and desired response format,
 * and interacts with the specified AI language model to generate the advertisement text.
 */
export class AdvertGenerator
{
    private productDto: ProductDto;
    private prompt: string ;
    private model : LanguageModel;
    /**
     * Creates an instance of the AdvertGenerator class.
     * @param productData - The data transfer object containing product information.
     * @param responseType - The type of response expected (e.g., text, HTML).
     * @param model - The AI language model to use for generation (optional).
     */
    constructor(productData: ProductDto, responseType: string, model?: LanguageModel) {
        this.productDto = productData;
        this.prompt =this.generatePrompt(productData, responseType);
        this.model = model? model : google('gemini-pro');
    }
    /**
     * Generates a prompt for the AI model based on product data and response type.
     * @param productData - The data transfer object containing product information.
     * @param responseType - The type of response expected (e.g., text, HTML).
     * @returns The generated prompt as a string.
     */
    private generatePrompt(productData: ProductDto, responseType: string) : string{
        return `You are a world-class advertising copywriter specializing in direct-response marketing. Your task is to generate a highly persuasive and professional advertisement copy based on the provided product data and marketing context.

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
        ${responseType === "html" ? "6. format the advertisement using HTML tags (e.g., <h1> for headlines, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis). Don't add <body>, <html>, or <head> tags." : ""}

        **PRODUCT DATA:**
        - Name: ${productData.title}
        - Description: ${productData.description}
        - Price: ${productData.price} €
        - Brand: ${productData.mark.name}
        - Product category: ${productData.category.name}

        **CONSTRAINT & OUTPUT RULES:**
        - The advertisement must be **under 150 words total**.
        - All content must be directly relevant to the provided data.
        - Do not include any introductory text, preambles, or explanations (e.g., "Here is your ad...").
        - Output only the final, formatted advertisement text.
        - **DO NOT** use Markdown, bullet points, numbered lists or any special characters (including '\n', '\r', '\t', or '-' for lists) that would normally create line breaks or formatting. The text must flow continuously.
        `;
    }
    /**
     * Generates an advertisement based on the provided product data and response type.
     * @returns The generated advertisement as a string.
     */
    public async getGeneratedAdvert (): Promise<string>{
        
        if(this.model == null){
            throw new Error("Model is not defined");
        }
        console.log("Prompt:", this.prompt);
        console.log("Model:", this.model);
        const result = await generateText({
            model: this.model,
            prompt: this.prompt,
        });
        console.log("Generation result:", result);
        if (result && result.text) {
            const sanitizedText = this.sanatizeResponse(result.text);
            return sanitizedText;
        }
        else {
            throw new Error("Error generating text");
        }
    }

    private sanatizeResponse(text: string) : string{
        return text.replace(/[\n\r\t]/g, ' ').trim();
    }

}