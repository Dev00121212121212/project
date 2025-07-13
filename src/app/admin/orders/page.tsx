
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format } from 'date-fns';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList = Object.keys(ordersData)
          .map(key => ({ ...ordersData[key], id: key }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by most recent
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatAddress = (address: Order['shippingAddress']) => {
    if (!address) return "N/A";
    return (
      <div>
        <p className="font-medium">{address.name}</p>
        <p>{address.line1}</p>
        <p>{`${address.city}, ${address.state} ${address.zip}`}</p>
      </div>
    );
  }

  const formatPhoneNumberForWa = (phone: string) => {
    return phone.replace(/\D/g, '');
  }

  const renderContactLink = (mobile?: string) => {
      if (!mobile) return "N/A";
      return (
        <Link 
            href={`https://wa.me/${formatPhoneNumberForWa(mobile)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
        >
            <WhatsAppIcon className="h-5 w-5"/>
            <span>{mobile}</span>
        </Link>
      )
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg">
                  <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Painting</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Shipping Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {orders.map((order) => (
                      <TableRow key={order.id}>
                          <TableCell>
                              {order.createdAt ? format(new Date(order.createdAt), 'PPpp') : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-4">
                                {order.paintingImageUrl && (
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                        <Image
                                            src={order.paintingImageUrl}
                                            alt={order.paintingTitle}
                                            fill
                                            className="object-contain"
                                            data-ai-hint="art painting"
                                        />
                                    </div>
                                )}
                                <span>{order.paintingTitle}</span>
                            </div>
                          </TableCell>
                          <TableCell>₹{order.price.toLocaleString()}</TableCell>
                          <TableCell>{formatAddress(order.shippingAddress)}</TableCell>
                          <TableCell>{renderContactLink(order.shippingAddress?.mobile)}</TableCell>
                          <TableCell><Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                  </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                  {orders.map((order) => (
                      <Card key={order.id} className="shadow-md">
                          <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{order.paintingTitle}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{order.createdAt ? format(new Date(order.createdAt), 'PP') : 'N/A'}</p>
                                </div>
                                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>{order.status}</Badge>
                              </div>
                               <p className="text-xl font-bold text-primary pt-2">₹{order.price.toLocaleString()}</p>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm">
                              {order.paintingImageUrl && (
                                <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
                                    <Image
                                        src={order.paintingImageUrl}
                                        alt={order.paintingTitle}
                                        fill
                                        className="object-contain"
                                        data-ai-hint="art painting"
                                    />
                                </div>
                              )}
                              <Separator />
                              <div>
                                  <h4 className="font-semibold mb-1">Shipping Address</h4>
                                  <div className="text-muted-foreground">
                                    {formatAddress(order.shippingAddress)}
                                  </div>
                              </div>
                              <div>
                                  <h4 className="font-semibold mb-1">Contact</h4>
                                  <div className="text-muted-foreground">
                                    {renderContactLink(order.shippingAddress?.mobile)}
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
