
'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, Shapes, Brush, Users } from 'lucide-react';

type Stats = {
  totalLikes: number;
  totalOrders: number;
  totalCategories: number;
  totalPaintings: number;
  totalArtists: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paintingsRef = ref(database, 'paintings');
    const ordersRef = ref(database, 'orders');
    const categoriesRef = ref(database, 'categories');
    const artistsRef = ref(database, 'artists');

    let totalLikes = 0;
    let totalPaintings = 0;
    let totalOrders = 0;
    let totalCategories = 0;
    let totalArtists = 0;

    const allStats: Partial<Stats> = {};

    const updateStats = () => {
        setStats(prev => ({ ...prev, ...allStats } as Stats));
    };

    const unsubscribePaintings = onValue(paintingsRef, (snapshot) => {
      const paintingsData = snapshot.val();
      if (paintingsData) {
        allStats.totalLikes = Object.values(paintingsData).reduce((sum: number, painting: any) => sum + (painting.likes || 0), 0);
        allStats.totalPaintings = Object.keys(paintingsData).length;
      } else {
        allStats.totalLikes = 0;
        allStats.totalPaintings = 0;
      }
      updateStats();
    });

    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const ordersData = snapshot.val();
      allStats.totalOrders = ordersData ? Object.keys(ordersData).length : 0;
      updateStats();
    });

    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const categoriesData = snapshot.val();
      allStats.totalCategories = categoriesData ? Object.keys(categoriesData).length : 0;
      updateStats();
    });
    
    const unsubscribeArtists = onValue(artistsRef, (snapshot) => {
      const artistsData = snapshot.val();
      allStats.totalArtists = artistsData ? Object.keys(artistsData).length : 0;
      updateStats();
    });
    
    // This allows all listeners to fire at least once before we stop loading
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => {
      unsubscribePaintings();
      unsubscribeOrders();
      unsubscribeCategories();
      unsubscribeArtists();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {isLoading || !stats ? (
        <p>Loading stats...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paintings</CardTitle>
              <Brush className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPaintings?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">In the gallery</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArtists?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Featured artists</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Across all paintings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders?.toLocaleString() || 0}</div>
               <p className="text-xs text-muted-foreground">Successful purchases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Shapes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Artwork classifications</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
