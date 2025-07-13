
export type Painting = {
  id: string; // Changed to string to accommodate Firebase keys
  title: string;
  artist: string;
  style: string;
  description: string;
  price: number;
  imageUrl: string;
  likes: number;
  createdAt: number;
  availableSizes?: string[];
};

export type Order = {
  id: string;
  paintingId: string;
  paintingTitle: string;
  paintingImageUrl: string;
  price: number;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
    mobile: string;
  };
  status: string;
  createdAt: number;
  userId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type SiteSettings = {
  logoUrl: string;
  siteDescription: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  address: string;
  email: string;
  phone: string;
};

export type Artist = {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
};
