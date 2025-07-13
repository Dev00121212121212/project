
import type { Painting } from "./types";

// This file is now a fallback or for seeding, as data is primarily fetched from Firebase.
export const paintings: Painting[] = [
  {
    id: "1",
    title: "Celestial Dream",
    artist: "Eleanor Vance",
    style: "Abstract",
    description: "An abstract representation of a star-filled night sky, exploring the themes of dreams and the cosmos.",
    price: 850,
    imageUrl: "https://placehold.co/600x450/4B0082/E6E6FA",
    likes: 42,
  },
  {
    id: "2",
    title: "Urban Pulse",
    artist: "Marco Diaz",
    style: "Impressionism",
    description: "The vibrant, bustling energy of a city street at dusk, captured with bold strokes and a rich color palette.",
    price: 1200,
    imageUrl: "https://placehold.co/600x450/C0B283/4B0082",
    likes: 101,
  },
  {
    id: "3",
    title: "Serene Lakeside",
    artist: "Clara Renault",
    style: "Realism",
    description: "A hyper-realistic depiction of a calm lakeside at dawn, focusing on the interplay of light and water.",
    price: 2500,
    imageUrl: "https://placehold.co/600x450/E6E6FA/4B0082",
    likes: 88,
  },
];
