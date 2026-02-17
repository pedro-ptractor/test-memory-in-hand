export interface AdminPhotoPackListDTO {
  id: string;
  status: string;
  trackingCode: string | null;
  shippingDate: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    city: string | null;
    state: string | null;
  };
}
