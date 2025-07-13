
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { database, app } from "@/lib/firebase";
import { ref, get, push, set, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useParams, useRouter, usePathname } from "next/navigation";
import type { Painting } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Palette, Ruler } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const [painting, setPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [address, setAddress] = useState({
    name: "",
    line1: "",
    city: "",
    state: "",
    zip: "",
    mobile: "",
  });
  
  const { toast } = useToast();
  const params = useParams();
  const paintingId = params.id as string;
  const router = useRouter();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const [activeCategory, setActiveCategory] = useState('Home');
  const pathname = usePathname();


  useEffect(() => {
    if (!paintingId) return;

    const fetchPainting = async () => {
      const paintingRef = ref(database, `paintings/${paintingId}`);
      try {
        const snapshot = await get(paintingRef);
        if (snapshot.exists()) {
          setPainting({ ...snapshot.val(), id: snapshot.key });
        } else {
          toast({
            variant: "destructive",
            title: "Artwork not found",
            description: "The artwork you're looking for doesn't exist.",
          });
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching painting:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch artwork details.",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPainting();
  }, [paintingId, router, toast]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };
  
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!painting) return;

    if (Object.values(address).some(field => field === '')) {
      toast({
        variant: "destructive",
        title: "Incomplete Address",
        description: "Please fill out all address fields before proceeding.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: painting.price }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Srujanika art',
        description: `Purchase of "${painting.title}"`,
        image: painting.imageUrl,
        order_id: order.id,
        handler: async function (paymentResponse: any) {
            try {
              const ordersRef = ref(database, 'orders');
              const newOrderRef = push(ordersRef);
              await set(newOrderRef, {
                paintingId: painting.id,
                paintingTitle: painting.title,
                paintingImageUrl: painting.imageUrl,
                price: painting.price,
                shippingAddress: address,
                status: 'paid',
                createdAt: serverTimestamp(),
                userId: user?.uid || 'guest',
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });

              toast({
                title: "Payment Successful!",
                description: "Your order has been placed.",
              });
              router.push('/');

            } catch(error) {
               console.error("Error saving order to Firebase:", error);
               toast({
                variant: "destructive",
                title: "Order Save Failed",
                description: "Payment was successful, but we couldn't save your order. Please contact support.",
              });
            } finally {
               setIsLoading(false);
            }
        },
        prefill: {
            name: address.name,
            contact: address.mobile,
        },
        theme: {
            color: '#4B0082' // primary color
        },
        modal: {
            ondismiss: function() {
                setIsLoading(false); // Re-enable button if user closes modal
            }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Could not initiate payment. Please try again.",
      });
      setIsLoading(false);
    } 
  };
  
  if (isFetching || !painting) {
    return (
        <div className="flex flex-col min-h-screen">
         <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} pathname={pathname}/>
          <main className="flex-1 container mx-auto px-4 py-8 pt-28">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <div className="grid gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
              </div>
          </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} pathname={pathname} />
      <main className="flex-1 container mx-auto px-4 py-8 pt-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
              <h1 className="text-4xl font-bold font-headline text-center">Checkout</h1>
              <p className="text-muted-foreground text-center mt-2">
                  Review your order and complete your purchase.
              </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column: Painting Details */}
            <div>
              <Card>
                <CardHeader className="p-0">
                    <div className="w-full relative overflow-hidden rounded-t-lg bg-card">
                       <Image 
                          src={painting.imageUrl} 
                          alt={painting.title} 
                          width={600}
                          height={450}
                          className="w-full h-auto object-cover" 
                          data-ai-hint="art painting"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-3xl">{painting.title}</CardTitle>
                  <CardDescription className="text-lg !mt-1">
                    by {painting.artist}
                  </CardDescription>
                  <div className="flex justify-between items-center pt-2">
                      <Badge variant="secondary" className="text-sm">{painting.style}</Badge>
                      <p className="text-2xl font-bold text-primary font-headline">₹{painting.price.toLocaleString()}</p>
                  </div>
                  <Separator className="my-4" />
                   <p className="text-sm text-muted-foreground">{painting.description}</p>
                   {painting.availableSizes && painting.availableSizes.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                Available Sizes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {painting.availableSizes.map(size => (
                                    <Badge key={size} variant="outline">{size}</Badge>
                                ))}
                            </div>
                        </div>
                      </>
                   )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Shipping & Payment Form */}
            <div>
                <form onSubmit={handlePurchase} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-headline">Shipping & Payment</CardTitle>
                            <CardDescription>Enter your details to complete the purchase.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Contact Details</h3>
                                <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={address.name} onChange={handleAddressChange} placeholder="Jane Doe" required />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input id="mobile" type="tel" value={address.mobile} onChange={handleAddressChange} placeholder="123-456-7890" required />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Shipping Address</h3>
                                <div className="space-y-2">
                                <Label htmlFor="line1">Address</Label>
                                <Input id="line1" value={address.line1} onChange={handleAddressChange} placeholder="123 Artistic Ave, Apt 4B" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2 sm:col-span-1">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={address.city} onChange={handleAddressChange} placeholder="Artville" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State / Province</Label>
                                    <Input id="state" value={address.state} onChange={handleAddressChange} placeholder="CA" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                                    <Input id="zip" value={address.zip} onChange={handleAddressChange} placeholder="90210" required />
                                </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                          <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                              <CreditCard className="mr-2 h-4 w-4" />
                              {isLoading ? "Processing..." : `Proceed to Pay ₹${painting.price.toLocaleString()}`}
                          </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
