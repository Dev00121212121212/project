
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { database, storage } from '@/lib/firebase';
import { ref, push, onValue, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Artist } from '@/lib/types';
import { Trash2, Edit, UploadCloud } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

const initialArtistState: Partial<Artist> = {
  name: '',
  bio: '',
  imageUrl: '',
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const artistsRef = ref(database, 'artists');
    const unsubscribe = onValue(artistsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const artistsList: Artist[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setArtists(artistsList);
      } else {
        setArtists([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteArtist = async (id: string) => {
    try {
      await remove(ref(database, `artists/${id}`));
      toast({
        title: 'Artist deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete artist.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <ArtistForm onFinished={() => {}} />

      <Card>
        <CardHeader>
          <CardTitle>Existing Artists</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {artists.map(artist => (
             <Dialog key={artist.id}>
              <li className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-4">
                  <Image src={artist.imageUrl} alt={artist.name} width={40} height={40} className="rounded-full h-10 w-10 object-cover" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{artist.name}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">{artist.bio}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the artist.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteArtist(artist.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Edit Artist</DialogTitle>
                      <DialogDescription>Update the details for this artist.</DialogDescription>
                  </DialogHeader>
                  <ArtistForm 
                      artist={artist}
                      onFinished={() => {}} 
                  />
              </DialogContent>
             </Dialog>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


type ArtistFormProps = {
    artist?: Artist | null;
    onFinished: () => void;
}

function ArtistForm({ artist, onFinished }: ArtistFormProps) {
    const [formData, setFormData] = useState<Partial<Artist>>(initialArtistState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (artist) {
            setFormData(artist);
            setImagePreview(artist.imageUrl);
        } else {
            setFormData(initialArtistState);
            setImagePreview(null);
            setImageFile(null);
        }
    }, [artist])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.bio) {
             toast({ variant: 'destructive', title: 'Please fill in all fields.' });
             return;
        }
        if (!artist && !imageFile) {
            toast({ variant: 'destructive', title: 'Please provide an image for the new artist.' });
            return;
        }

        setIsLoading(true);

        try {
            let imageUrl = formData.imageUrl || '';
            if (imageFile) {
                 const options = {
                    maxSizeMB: 0.05, // 50KB
                    maxWidthOrHeight: 400,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(imageFile, options);
                const imageStorageRef = storageRef(storage, `artist-images/${Date.now()}_${compressedFile.name}`);
                const snapshot = await uploadBytes(imageStorageRef, compressedFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const artistData: Omit<Artist, 'id'> = {
                name: formData.name,
                bio: formData.bio,
                imageUrl: imageUrl,
            };

            if (artist) { // Editing existing artist
                await set(ref(database, `artists/${artist.id}`), artistData);
                toast({ title: 'Artist updated successfully!' });
            } else { // Adding new artist
                await push(ref(database, 'artists'), artistData);
                toast({ title: 'Artist added successfully!' });
                setFormData(initialArtistState);
                setImagePreview(null);
                setImageFile(null);
            }

            if (onFinished) onFinished();


        } catch (error) {
            console.error('Error saving artist:', error);
            toast({ variant: 'destructive', title: 'Failed to save artist.' });
        } finally {
            setIsLoading(false);
        }
    }
    
    const isEditMode = !!artist;

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Artist' : 'Add New Artist'}</CardTitle>
                    <CardDescription>{isEditMode ? 'Update the details for this artist.' : 'Add a new artist to your gallery.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-2">
                             <Label>Artist Photo</Label>
                             <Label htmlFor="imageUrl" className="w-full cursor-pointer">
                                <div className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex flex-col items-center justify-center relative overflow-hidden bg-card">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Artist preview" fill className="object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-2 flex flex-col justify-center items-center">
                                            <UploadCloud className="mx-auto h-8 w-8 mb-1" />
                                            <p className="font-semibold text-sm">Upload Photo</p>
                                        </div>
                                    )}
                                </div>
                             </Label>
                             <Input id="imageUrl" type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Artist Name</Label>
                                <Input id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g., Vincent van Gogh" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Biography</Label>
                                <Textarea id="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="A short bio about the artist..." rows={4} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                   {isEditMode && <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>}
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Artist')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
