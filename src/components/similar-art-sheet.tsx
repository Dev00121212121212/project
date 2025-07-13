
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import type { Painting } from "@/lib/types";
import { useState } from "react";
import { suggestSimilarArt, type SuggestSimilarArtOutput } from "@/ai/flows/suggest-similar-art";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Sparkles, CreditCard } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type SimilarArtSheetProps = {
  painting: Painting;
  isOpen: boolean;
  onClose: () => void;
};

export function SimilarArtSheet({ painting, isOpen, onClose }: SimilarArtSheetProps) {
  const [suggestions, setSuggestions] = useState<SuggestSimilarArtOutput['suggestions']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestSimilarArt({ description: painting.description });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get similar art suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset state on close
      setSuggestions([]);
      setIsLoading(false);
    }
  }

  const handlePurchaseClick = () => {
    onClose();
    router.push(`/checkout/${painting.id}`);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <ScrollArea className="h-full w-full pr-6">
          <SheetHeader className="mb-4 text-left">
            <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-muted">
                <Image 
                  src={painting.imageUrl} 
                  alt={painting.title} 
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover" 
                  data-ai-hint="art painting"
                />
            </div>
            <SheetTitle className="font-headline text-3xl">{painting.title}</SheetTitle>
            <SheetDescription className="text-lg !mt-1">
              by {painting.artist}
            </SheetDescription>
            <div className="flex justify-between items-center pt-2">
                <Badge variant="secondary" className="text-sm">{painting.style}</Badge>
                <p className="text-2xl font-bold text-primary font-headline">₹{painting.price.toLocaleString()}</p>
            </div>
          </SheetHeader>
          <p className="text-sm text-muted-foreground mb-6">{painting.description}</p>
          
          <Button onClick={handlePurchaseClick} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
             <CreditCard className="mr-2 h-4 w-4" />
             Proceed to Purchase
          </Button>

          <div className="mt-8">
            <Button onClick={handleGetSuggestions} disabled={isLoading} variant="outline" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? "Finding similar art..." : "Suggest Similar Art"}
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && (
                <>
                    <SuggestionSkeleton />
                    <SuggestionSkeleton />
                </>
            )}
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg bg-card">
                 <div className="w-24 h-24 relative flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <Image src={suggestion.imageUrl} alt={suggestion.title} fill className="object-contain" data-ai-hint="art painting" />
                 </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.artist}</p>
                  <p className="text-sm mt-1">{suggestion.description.substring(0, 100)}...</p>
                  <p className="text-md font-bold text-primary mt-2">₹{suggestion.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}


const SuggestionSkeleton = () => (
    <div className="flex gap-4 p-4 border rounded-lg bg-card">
        <Skeleton className="w-24 h-24 flex-shrink-0 rounded-md" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-1/4 mt-2" />
        </div>
    </div>
)
