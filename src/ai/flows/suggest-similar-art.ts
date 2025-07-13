'use server';

/**
 * @fileOverview Provides AI-powered suggestions for similar artworks based on a selected painting's style and preferences.
 *
 * - suggestSimilarArt - A function that accepts a description of a painting and returns suggestions for similar artworks.
 * - SuggestSimilarArtInput - The input type for the suggestSimilarArt function, including a description of the painting.
 * - SuggestSimilarArtOutput - The return type for the suggestSimilarArt function, providing a list of suggested artworks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarArtInputSchema = z.object({
  description: z.string().describe('The description of the painting for which to find similar artworks.'),
});
export type SuggestSimilarArtInput = z.infer<typeof SuggestSimilarArtInputSchema>;

const SuggestedArtworkSchema = z.object({
  title: z.string().describe('The title of the suggested artwork.'),
  artist: z.string().describe('The artist of the suggested artwork.'),
  style: z.string().describe('The style of the suggested artwork.'),
  description: z.string().describe('A brief description of the suggested artwork.'),
  imageUrl: z.string().url().describe('URL of the suggested artwork image.'),
  price: z.number().describe('The price of the suggested artwork.'),
});

const SuggestSimilarArtOutputSchema = z.object({
  suggestions: z.array(SuggestedArtworkSchema).describe('A list of suggested artworks similar to the input painting.'),
});
export type SuggestSimilarArtOutput = z.infer<typeof SuggestSimilarArtOutputSchema>;

export async function suggestSimilarArt(input: SuggestSimilarArtInput): Promise<SuggestSimilarArtOutput> {
  return suggestSimilarArtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarArtPrompt',
  input: {schema: SuggestSimilarArtInputSchema},
  output: {schema: SuggestSimilarArtOutputSchema},
  prompt: `You are an art expert. Given the description of a painting, suggest other artworks that are similar in style and that the user might like.

Description of painting: {{{description}}}

Please provide a list of suggestions, with each suggestion including the title, artist, style, a brief description, the URL of the artwork image, and the price.
`,
});

const suggestSimilarArtFlow = ai.defineFlow(
  {
    name: 'suggestSimilarArtFlow',
    inputSchema: SuggestSimilarArtInputSchema,
    outputSchema: SuggestSimilarArtOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
