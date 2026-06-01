export type ApiResponse<T = undefined> = {
  message: string;
  statusCode: number;
  data?: T;
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  statusCode: number;
};

export type User = {
  id: number;
  name: string;
  pin?: number;
  id_device?: string;
  email: string;
};

export type Product = {
  id: number;
  descripcion: string;
  tamaño: string;
  id_proveedor: number;
  precio: number;
  cantidad: number;
};

export type Provider = {
  id: number;
  nombreEmpresa: string;
  email: string;
  telefono: string;
  nombreContacto: string;
  emailContacto?: string | null;
  direccion?: string | null;
};

export type ProductInput = Omit<Product, 'id'>;
export type ProviderInput = Omit<Provider, 'id'>;
export type UserInput = {
  name: string;
  pin: number;
  email: string;
  id_device: string;
  notifPush: string;
};
