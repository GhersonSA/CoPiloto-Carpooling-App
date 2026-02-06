// Inicio de sesion con NextAuth y Google OAuth2
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { query } from "@/lib/db";

const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const { email, name } = user;

          if (!email) return false;

          const existingUser = await query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          if (existingUser.rows.length === 0) {
            await query(
              `INSERT INTO users (nombre, username, email, password, provider, provider_id) 
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                name || email.split("@")[0],
                email.split("@")[0],
                email,
                null,
                "google",
                account.providerAccountId,
              ]
            );
            console.log("Usuario de Google creado:", email);
          }
        }
        return true;
      } catch (err) {
        console.error("Error en signIn Google:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await query(
            "SELECT id, nombre, username, email, provider FROM users WHERE email = $1",
            [user.email]
          );
          if (dbUser.rows.length > 0) {
            token.id = dbUser.rows[0].id;
            token.nombre = dbUser.rows[0].nombre;
            token.username = dbUser.rows[0].username;
            token.provider = dbUser.rows[0].provider;
          }
        } catch (err) {
          console.error("Error en jwt callback:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as number;
        session.user.nombre = token.nombre as string;
        session.user.username = token.username as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
