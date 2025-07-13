
"use client";

import type { Painting } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { database } from "@/lib/firebase";
import { ref, update, increment, onValue } from "firebase/database";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type PaintingCardProps = {
  painting: Painting;
};

export function PaintingCard({ painting }: PaintingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(painting.likes);
  const router = useRouter();

  useEffect(() => {
    const paintingRef = ref(database, `paintings/${painting.id}`);
    const unsubscribe = onValue(paintingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLikeCount(data.likes);
      }
    });

    const likedPaintings = JSON.parse(localStorage.getItem('likedPaintings') || '{}');
    if (likedPaintings[painting.id]) {
      setIsLiked(true);
    }

    return () => unsubscribe();
  }, [painting.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const paintingRef = ref(database, `paintings/${painting.id}`);
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    const likedPaintings = JSON.parse(localStorage.getItem('likedPaintings') || '{}');
    if (newLikedState) {
      likedPaintings[painting.id] = true;
    } else {
      delete likedPaintings[painting.id];
    }
    localStorage.setItem('likedPaintings', JSON.stringify(likedPaintings));

    try {
      await update(paintingRef, {
        likes: increment(newLikedState ? 1 : -1),
      });
    } catch (error) {
      console.error("Failed to update likes:", error);
      setIsLiked(!newLikedState);
      const revertedLikedPaintings = JSON.parse(localStorage.getItem('likedPaintings') || '{}');
      if (!newLikedState) {
        revertedLikedPaintings[painting.id] = true;
      } else {
        delete revertedLikedPaintings[painting.id];
      }
      localStorage.setItem('likedPaintings', JSON.stringify(revertedLikedPaintings));
    }
  };
  
  const handleDetailsClick = () => {
    router.push(`/checkout/${painting.id}`);
  };


  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 rounded-lg shadow-md hover:shadow-xl">
      <CardHeader className="!p-0">
         <div className="relative overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
          <Image
            src={painting.imageUrl}
            alt={painting.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="art painting"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-semibold tracking-tight text-primary mb-1">{painting.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{painting.artist}</p>
          <p className="text-sm text-muted-foreground mt-1">{painting.style}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">₹{painting.price.toLocaleString()}</p>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
                <button 
                onClick={handleLike} 
                aria-label="Like painting"
                className="rounded-full p-1.5 text-foreground transition-colors hover:bg-red-500/10 z-10"
                >
                <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "")} />
                </button>
                <span className="text-sm font-medium">{likeCount}</span>
            </div>
            <Button onClick={handleDetailsClick} variant="outline">Details</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
