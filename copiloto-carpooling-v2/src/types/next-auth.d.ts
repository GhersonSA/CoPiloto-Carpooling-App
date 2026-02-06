import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      nombre: string;
      username: string;
      email: string;
      provider: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    nombre: string;
    username: string;
    email: string;
    provider: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    nombre?: string;
    username?: string;
    provider?: string;
  }
}
