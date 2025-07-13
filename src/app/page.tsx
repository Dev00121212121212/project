
'use client';

import { Header } from "@/components/header";
import { PaintingGallery } from "@/components/painting-gallery";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { Painting, SiteSettings, Artist } from "@/lib/types";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Linkedin, Youtube, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { GalleryControls } from "@/components/gallery-controls";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#", label: "New Arrivals" },
  { href: "#", label: "Best Sellers" },
  { href: "#", label: "Wall Art" },
];

export default function Home() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [styleFilter, setStyleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('price-asc');
  const [activeCategory, setActiveCategory] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const paintingsRef = ref(database, 'paintings');
    const categoriesRef = ref(database, 'categories');
    const settingsRef = ref(database, 'siteSettings');
    const artistsRef = ref(database, 'artists');

    const unsubscribePaintings = onValue(paintingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const paintingsData = snapshot.val();
        const paintingsList = Object.keys(paintingsData)
          .map(key => ({ ...paintingsData[key], id: key, createdAt: paintingsData[key].createdAt || 0 }))
        setPaintings(paintingsList);
      } else {
        setPaintings([]);
      }
      setIsLoading(false);
    });

    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesList = Object.values(categoriesData).map((cat: any) => cat.name);
        setCategories(categoriesList);
      } else {
        setCategories([]);
      }
    });

     const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.val());
      }
    });
    
    const unsubscribeArtists = onValue(artistsRef, (snapshot) => {
        if (snapshot.exists()) {
            const artistsData = snapshot.val();
            const artistsList = Object.keys(artistsData).map(key => ({...artistsData[key], id: key}));
            setArtists(artistsList);
        } else {
            setArtists([]);
        }
    });

    return () => {
      unsubscribePaintings();
      unsubscribeCategories();
      unsubscribeSettings();
      unsubscribeArtists();
    };
  }, []);

  const styles = useMemo(() => ['All', ...new Set(paintings.map(p => p.style))], [paintings]);
  
  const filteredAndSortedPaintings = useMemo(() => {
    let processedPaintings = [...paintings];

    // Filter by search query
    if (searchQuery) {
      processedPaintings = processedPaintings.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by active category
    if (activeCategory !== 'Home' && activeCategory !== 'New Arrivals' && activeCategory !== 'Best Sellers' && activeCategory !== 'Wall Art') {
      processedPaintings = processedPaintings.filter(p => p.style === activeCategory);
    }
    
    // Filter by style dropdowns
    processedPaintings = processedPaintings
      .filter(p => styleFilter === 'All' || p.style === styleFilter);

    // Sort
    if (activeCategory === 'New Arrivals') {
      processedPaintings.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeCategory === 'Best Sellers') {
      processedPaintings.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
        processedPaintings.sort((a, b) => {
            if (sortOrder === 'price-asc') return a.price - b.price;
            if (sortOrder === 'price-desc') return b.price - a.price;
            return b.createdAt - a.createdAt; // Default to newest
        });
    }

    return processedPaintings;
      
  }, [paintings, styleFilter, sortOrder, activeCategory, searchQuery]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        siteSettings={siteSettings}
      />
      <main className="flex-1 pt-20">
        <section className="relative bg-background">
          <div className="absolute inset-0 bg-black/60 z-0" style={{backgroundImage: "url('/artist-bg.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
          <div className="relative z-10 container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-primary">Featured Artists</h2>
            <p className="text-muted-foreground text-center mb-8">Discover the creative minds behind the masterpieces.</p>
            {artists.length > 1 ? (
                <Carousel
                  opts={{
                    align: "start",
                    loop: artists.length > 4,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {artists.map((artist) => (
                      <CarouselItem key={artist.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <div className="p-4 flex flex-col items-center gap-4 group text-center">
                            <Image
                                src={artist.imageUrl}
                                alt={artist.name}
                                width={128}
                                height={128}
                                className="object-cover mx-auto rounded-full h-32 w-32 transition-transform duration-300 group-hover:scale-110 border-4 border-white/80 shadow-lg"
                                data-ai-hint="artist portrait"
                            />
                            <div className="text-center">
                                <h3 className="font-semibold text-lg text-foreground">{artist.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 h-12 overflow-hidden text-ellipsis">
                                    {artist.bio}
                                </p>
                            </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {artists.length > 4 && <>
                    <CarouselPrevious className="hidden md:flex bg-white/80 hover:bg-white text-primary" />
                    <CarouselNext className="hidden md:flex bg-white/80 hover:bg-white text-primary" />
                  </>}
                </Carousel>
            ) : artists.length === 1 && (
                <div className="flex justify-center">
                    <div className="p-4 flex flex-col items-center gap-4 group text-center">
                        <Image
                            src={artists[0].imageUrl}
                            alt={artists[0].name}
                            width={128}
                            height={128}
                            className="object-cover mx-auto rounded-full h-32 w-32 transition-transform duration-300 group-hover:scale-110 border-4 border-white/80 shadow-lg"
                            data-ai-hint="artist portrait"
                        />
                        <div className="text-center">
                            <h3 className="font-semibold text-lg text-foreground">{artists[0].name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                {artists[0].bio}
                            </p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </section>

        <div id="gallery-section" className="mb-16 md:-mt-16 relative z-20 container mx-auto px-4">
          <GalleryControls
            styles={styles}
            styleFilter={styleFilter}
            setStyleFilter={setStyleFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          ) : (
            <PaintingGallery paintings={filteredAndSortedPaintings} />
          )}
        </div>
      </main>
      <footer className="bg-card border-t text-card-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="flex flex-col lg:col-span-2">
               <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src={siteSettings?.logoUrl || "/logo.png"} alt="Srujanika art logo" width={32} height={32} className="h-8 w-8" />
                <h2 className="text-2xl font-bold text-primary tracking-wider">
                  Srujanika art
                </h2>
              </Link>
              {siteSettings ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    {siteSettings.siteDescription}
                  </p>
                  <div className="flex space-x-4 mt-6">
                    {siteSettings.facebookUrl && <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-6 w-6" /></a>}
                    {siteSettings.instagramUrl && <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6" /></a>}
                    {siteSettings.twitterUrl && <a href={siteSettings.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-6 w-6" /></a>}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setActiveCategory(link.label)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              {siteSettings ? (
                  <ul className="space-y-3 text-sm">
                    {siteSettings.address && (
                      <li className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{siteSettings.address}</span>
                      </li>
                    )}
                    {siteSettings.email && (
                      <li className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href={`mailto:${siteSettings.email}`} className="text-muted-foreground hover:text-primary transition-colors">{siteSettings.email}</a>
                      </li>
                    )}
                    {siteSettings.phone && (
                      <li className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${siteSettings.phone}`} className="text-muted-foreground hover:text-primary transition-colors">{siteSettings.phone}</a>
                      </li>
                    )}
                  </ul>
              ) : (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-black">Developer</h3>
              <div className="text-sm">
                <p className="font-medium text-black">Mr. Debasish Naik</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                  <a href="https://www.instagram.com/deva001_" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6" /></a>
                  <a href="https://in.linkedin.com/in/debasish-naik-0921a4229" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-6 w-6" /></a>
                  <a href="mailto:sourcerootedu@gmail.com" aria-label="Email" className="text-muted-foreground hover:text-primary transition-colors"><Mail className="h-6 w-6" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Srujanika art. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );

    