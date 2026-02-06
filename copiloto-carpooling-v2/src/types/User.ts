export interface User {
  id: number;
  nombre: string;
  username: string;
  email: string;
  provider?: string;
  role?: string;
}
