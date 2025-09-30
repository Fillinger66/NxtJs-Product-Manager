import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ProductDto } from '../dto/ProductDto';
import { AdvertGenerator } from './AdvertGenerator';


/**
 * Generates an advertisement based on the provided product data and response type.
 * @param productDto - The data transfer object containing product information.
 * @param responseType - The type of response expected (e.g., text, HTML).
 * @returns The generated advertisement as a string.
 */
export async function generateAdvert(productDto: ProductDto, responseType: string) : Promise<string> {

  const geminiModel = google('gemini-2.5-flash')
  console.log("Using model:", geminiModel);
  const advertGenerator = new AdvertGenerator(productDto, responseType, geminiModel);

  const result = await advertGenerator.getGeneratedAdvert();

  return result;

}
