import axios, { AxiosError } from 'axios';
import { getToken } from './session';
import type { ApiResponse, LoginResponse, Product, ProductInput, Provider, ProviderInput, User, UserInput } from '../types';

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

if (!apiUrl) {
  throw new Error('Falta configurar VITE_API_URL para conectar con el backend');
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export function getApiUrl() {
  return apiUrl;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Partial<ApiResponse> | undefined;
    return data?.message ?? error.message ?? 'No se pudo completar la operación';
  }
  return 'Ocurrió un error inesperado';
}

export async function login(pin: number, idDevice: string) {
  const { data } = await api.post<LoginResponse>('/login', { pin, id_device: idDevice });
  return data;
}

export async function registerUser(input: UserInput) {
  const { data } = await api.post<ApiResponse>('/Usuarios', input);
  return data;
}

export async function getUsers() {
  const { data } = await api.get<ApiResponse<User[]>>('/Usuarios');
  return data.data ?? [];
}

export async function deleteUser(id: number) {
  const { data } = await api.delete<ApiResponse>('/Usuarios?id=' + id);
  return data;
}

export async function getProducts() {
  const { data } = await api.get<ApiResponse<Product[]>>('/Productos');
  return data.data ?? [];
}

export async function createProduct(input: ProductInput) {
  const { data } = await api.post<ApiResponse>('/Productos', input);
  return data;
}

export async function updateProductStock(id: number, precio: number, cantidad: number) {
  const { data } = await api.put<ApiResponse>('/Productos/Actualizar', { id, precio, cantidad });
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await api.delete<ApiResponse>('/Productos?id=' + id);
  return data;
}

export async function getProviders() {
  const { data } = await api.get<ApiResponse<Provider[]>>('/Proveedores');
  return data.data ?? [];
}

export async function createProvider(input: ProviderInput) {
  const { data } = await api.post<ApiResponse>('/Proveedores', input);
  return data;
}

export async function deleteProvider(id: number) {
  const { data } = await api.delete<ApiResponse>('/Proveedores?id=' + id);
  return data;
}
