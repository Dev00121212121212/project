
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { database, storage, app } from "@/lib/firebase";
import { ref as dbRef, push, serverTimestamp, onValue } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import imageCompression from 'browser-image-compression';


export default function SubmitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [style, setStyle] = useState('');
  const [description, setDescription] = useState('');
  const [availableSizes, setAvailableSizes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If not logged in, redirect to login page.
        router.push('/admin/login');
      }
      setAuthLoading(false);
    });
    
    const categoriesRef = dbRef(database, 'categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
        if (snapshot.exists()) {
            const categoriesData = snapshot.val();
            const categoriesList = Object.values(categoriesData).map((cat: any) => cat.name);
            setCategories(categoriesList);
        } else {
            setCategories([]);
        }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCategories();
    }
  }, [auth, router]);
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !price || !style || !description) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to submit your artwork.",
        });
        return;
    }
    if (!imageFile) {
      toast({
          variant: "destructive",
          title: "Missing Image",
          description: "Please upload an image for the artwork.",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = `https://placehold.co/600x450`;

      if (imageFile) {
        const options = {
          maxSizeMB: 0.02,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(imageFile, options);
        const imageRef = storageRef(storage, `paintings/${Date.now()}_${compressedFile.name}`);
        const snapshot = await uploadBytes(imageRef, compressedFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const newPainting = {
        title,
        artist,
        style,
        description,
        price: parseInt(price, 10),
        imageUrl,
        likes: 0,
        createdAt: serverTimestamp(),
        availableSizes: availableSizes.split(',').map(s => s.trim()).filter(Boolean),
        userId: user?.uid
      };

      const paintingsRef = dbRef(database, 'paintings');
      await push(paintingsRef, newPainting);

      toast({
          title: "Submission Successful!",
          description: "Your artwork has been added to the gallery.",
      });
      
      router.push("/admin/paintings");
    } catch (error) {
      console.error("Error submitting artwork:", error);
      toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Could not submit artwork. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <p>Loading...</p>
  }
  
  return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-headline">Submit Your Artwork</h1>
          <p className="text-muted-foreground mt-2">
            Showcase your talent to the world. Fill out the form below.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Upload Column */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <Label htmlFor="picture" className="w-full cursor-pointer">
                <div className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex flex-col items-center justify-center relative overflow-hidden bg-card aspect-[4/3]">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Artwork preview" layout="fill" className="object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground p-4 flex flex-col justify-center items-center">
                      <UploadCloud className="mx-auto h-12 w-12 mb-2" />
                      <p className="font-semibold">Click or drag to upload</p>
                      <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </Label>
              <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
              {imageFile && <p className="text-sm text-muted-foreground">Selected: <span className="font-medium text-foreground">{imageFile.name}</span></p>}
            </div>

            {/* Form Fields Column */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>Provide the information for your masterpiece.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="The Starry Night" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input id="artist" placeholder="Vincent van Gogh" value={artist} onChange={e => setArtist(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <Input id="price" type="number" placeholder="120000" value={price} onChange={e => setPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style">Style/Category</Label>
                    <Select onValueChange={setStyle} value={style}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableSizes">Available Sizes (comma-separated)</Label>
                  <Input id="availableSizes" placeholder="e.g. 8x10, 16x20, 24x36" value={availableSizes} onChange={e => setAvailableSizes(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="A dreamy, swirling depiction of the night sky..." value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit for Review"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
  );
}
