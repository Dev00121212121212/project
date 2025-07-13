
'use client';

import { useState, useEffect } from 'react';
import { database, storage } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { SiteSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Facebook, Instagram, Twitter, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';


const initialSettings: SiteSettings = {
  siteDescription: 'The premier online marketplace for unique paintings from talented artists around the globe. Discover your next masterpiece.',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  address: '',
  email: '',
  phone: '',
  logoUrl: '/logo.png',
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const settingsRef = ref(database, 'siteSettings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings(data);
      } else {
        setSettings(initialSettings);
      }
      setIsFetching(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let logoUrl = settings.logoUrl;
      if (logoFile) {
        const options = {
          maxSizeMB: 0.02,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(logoFile, options);
        const logoStorageRef = storageRef(storage, `site-assets/logo_${Date.now()}_${compressedFile.name}`);
        const snapshot = await uploadBytes(logoStorageRef, compressedFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }
      
      const updatedSettings = { ...settings, logoUrl };

      const settingsRef = ref(database, 'siteSettings');
      await set(settingsRef, updatedSettings);
      setSettings(updatedSettings); // update local state with new URL

      toast({
        title: 'Settings Saved!',
        description: 'Your site settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save settings.',
        description: 'An error occurred while saving your changes.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                 <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-10 w-24" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage your website's general info, logo, and social media links here.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveChanges}>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Branding</h3>
                    <div className="space-y-2">
                      <Label>Site Logo</Label>
                      <div className="flex items-center gap-6">
                          <div className="w-24 h-24 relative rounded-md border p-2 flex items-center justify-center bg-muted/50">
                            <Image 
                              src={logoPreview || settings.logoUrl} 
                              alt="Logo preview" 
                              width={80} 
                              height={80} 
                              className="object-contain" 
                            />
                          </div>
                          <Label htmlFor="logo" className="w-full cursor-pointer">
                            <div className="w-full h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex flex-col items-center justify-center relative overflow-hidden bg-card">
                                <div className="text-center text-muted-foreground p-2 flex flex-col justify-center items-center">
                                  <UploadCloud className="mx-auto h-8 w-8 mb-1" />
                                  <p className="font-semibold text-sm">Click or drag to upload</p>
                                  <p className="text-xs mt-1">Recommended: PNG with transparent background</p>
                                </div>
                            </div>
                          </Label>
                          <Input id="logo" type="file" onChange={handleLogoChange} accept="image/png, image/jpeg, image/gif, image/svg+xml" className="hidden" />
                      </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">General Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Textarea id="siteDescription" placeholder="A short, catchy description of your marketplace." value={settings.siteDescription} onChange={handleInputChange} rows={3} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media Links</h3>
                    <div className="space-y-2 relative">
                        <Label htmlFor="facebookUrl" className="flex items-center gap-2"><Facebook className="w-4 h-4 text-muted-foreground" /> Facebook URL</Label>
                        <Input id="facebookUrl" placeholder="https://facebook.com/your-page" value={settings.facebookUrl} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagramUrl" className="flex items-center gap-2"><Instagram className="w-4 h-4 text-muted-foreground" /> Instagram URL</Label>
                        <Input id="instagramUrl" placeholder="https://instagram.com/your-profile" value={settings.instagramUrl} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="twitterUrl" className="flex items-center gap-2"><Twitter className="w-4 h-4 text-muted-foreground" /> Twitter URL</Label>
                        <Input id="twitterUrl" placeholder="https://twitter.com/your-handle" value={settings.twitterUrl} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="123 Art Avenue, Canvas City, 90210, USA" value={settings.address} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="contact@canvascloud.com" value={settings.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+1 (234) 567-890" value={settings.phone} onChange={handleInputChange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
