export type Staff = {
  id: string;
  name: string;
  nameEn: string;
};

export type Service = {
  id: string;
  timestamp: string;
  serviceType: string;
  carSize: string | null;
  staffId: string;
  staffName: string;
  staffNameEn: string;
  price: number;
  commission: number;
  userId: string;
  customerContact?: string;
  hasCoupon: boolean;
  paymentMethod?: 'cash' | 'machine';
};

export type ServicePrice = {
  price: number;
  commission: number;
  couponCommission?: number;
};

export type ServiceConfig = {
  prices: {
    [key: string]: ServicePrice;
  };
  needsSize: boolean;
  hasCoupon: boolean;
};

export type ServiceTypesConfig = {
  [key:string]: ServiceConfig;
};
