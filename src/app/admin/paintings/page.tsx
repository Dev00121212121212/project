
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { Painting } from "@/lib/types";

export default function AdminPaintingsPage() {
  const [paintings, setPaintings] = useState<Painting[]>([]);

  useEffect(() => {
    const paintingsRef = ref(database, 'paintings');
    const unsubscribe = onValue(paintingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const paintingsData = snapshot.val();
        const paintingsList = Object.keys(paintingsData)
          .map(key => ({ ...paintingsData[key], id: key }))
          .sort((a, b) => b.id - a.id);
        setPaintings(paintingsList);
      } else {
        setPaintings([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Paintings</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paintings.map((painting) => (
              <TableRow key={painting.id}>
                <TableCell className="font-medium">{painting.title}</TableCell>
                <TableCell>{painting.artist}</TableCell>
                <TableCell>{painting.style}</TableCell>
                <TableCell>${painting.price.toLocaleString()}</TableCell>
                <TableCell>{painting.likes}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
