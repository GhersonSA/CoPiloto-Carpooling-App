<p align="center">
  <img src="copiloto-carpooling-v2/public/assets/CoPiloto-logo-1.png" alt="CoPiloto Logo" width="200" height="350"/>
</p>

# CoPiloto Carpooling

Aplicación de carpooling para compartir viajes entre usuarios. Incluye autenticación con Google OAuth, gestión de viajes, búsqueda en tiempo real y notificaciones.



## Estructura del proyecto

```
copiloto/
├── copiloto-carpooling-v2/  # Frontend Next.js
├── copiloto-nest-backend/   # API REST con NestJS
└── copiloto-react-native/   # App móvil (Expo)
```

## Stack tecnológico

**Frontend (Web)**
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- NextAuth v5 (Google OAuth)
- React Google Maps API

**Backend (API)**
- NestJS
- PostgreSQL
- JWT (httpOnly cookies)
- Passport.js + bcrypt
- cookie-parser

**Mobile**
- React Native + Expo
- NativeWind
- AsyncStorage

## Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- Cuenta de Google Cloud (para OAuth)
- Google Maps API Key

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/GhersonSA/CoPiloto-Carpooling-App.git
cd CoPiloto-Carpooling-App
```

### 2. Configurar la base de datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE copiloto;
```

Ejecuta las migraciones o crea la tabla manualmente:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar variables de entorno

#### Backend (`copiloto-nest-backend/.env`)

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/copiloto
JWT_SECRET=tu_secreto_jwt_super_largo_y_seguro
FRONTEND_URL=http://localhost:3000

# Variables para seed (usuarios de prueba)
ADMIN_PASS=admin123
GUEST_PASS=guest123
```

#### Frontend (`copiloto-carpooling-v2/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=otro_secreto_largo_diferente_del_jwt

# Google OAuth (obtenlo desde Google Cloud Console)
AUTH_GOOGLE_ID=tu_google_client_id
AUTH_GOOGLE_SECRET=tu_google_client_secret

# Google Maps (para geolocalización)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

#### Mobile (`copiloto-react-native/.env`)

```env
# Cambia la IP por la de tu máquina local
EXPO_PUBLIC_API_URL=http://192.168.0.21:4000
```

### 4. Instalar dependencias

```bash
# Backend
cd copiloto-nest-backend
npm install

# Frontend
cd ../copiloto-carpooling-v2
npm install

# Mobile (opcional)
cd ../copiloto-react-native
npm install
```

### 5. Poblar la base de datos (opcional)

Si quieres usuarios de prueba:

```bash
cd copiloto-nest-backend
node src/database/seeds/seed-users.js
```

Esto crea usuarios de prueba con los datos que configures en tu `.env`.

## Ejecución

### Backend

```bash
cd copiloto-nest-backend
npm run start:dev
```

La API corre en `http://localhost:4000`

### Frontend

```bash
cd copiloto-carpooling-v2
npm run dev
```

La web corre en `http://localhost:3000`

### Mobile

```bash
cd copiloto-react-native
npx expo start
```

Escanea el QR con Expo Go desde tu móvil.

## Funcionalidades principales

- **Autenticación**: Login local + Google OAuth + modo invitado
- **Panel de admin**: Gestión de usuarios (solo para rol admin)
- **Búsqueda de viajes**: Filtros por origen, destino y fecha
- **Creación de viajes**: Formulario con geolocalización
- **Notificaciones**: Sistema en tiempo real (pendiente)
- **Responsive**: Diseño adaptado a móviles y escritorio

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Activa la API de Google+ (OAuth 2.0)
4. Crea credenciales (OAuth 2.0 Client ID)
5. Añade URIs autorizados:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/callback/google`
6. Copia el Client ID y Secret a tu `.env.local`

## Estructura de carpetas (Web)

```
copiloto-carpooling-v2/
├── src/
│   ├── app/              # App Router (Next.js 16)
│   │   ├── api/          # Proxy routes a NestJS
│   │   ├── admin/        # Panel de administración
│   │   └── home/         # Home de usuario
│   ├── components/       # Componentes reutilizables
│   ├── features/         # Componentes de features
│   ├── hooks/            # Custom hooks (useAuth, etc.)
│   └── context/          # Context API
└── public/               # Assets estáticos
```

## Problemas comunes

**Error 401 en login**
- Verifica que el backend esté corriendo en el puerto 4000
- Revisa que `JWT_SECRET` esté configurado
- Comprueba que las cookies se envían correctamente

**Google OAuth no funciona**
- Verifica las URIs autorizadas en Google Cloud Console
- Asegúrate de tener `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` correctos
- Revisa que `NEXTAUTH_URL` apunte a tu dominio

**Error de CORS**
- Verifica que `FRONTEND_URL` en el backend apunte a `http://localhost:3000`
- Comprueba que `credentials: true` esté configurado en el proxy

**Error en base de datos**
- Confirma que PostgreSQL esté corriendo
- Verifica la `DATABASE_URL` en el `.env` del backend
- Comprueba que la tabla `users` exista

## Licencia

MIT License - [GhersonSA](https://github.com/GhersonSA)

---

**Autor**: Gherson SA  
**Portfolio**: [ghersonsa.com](https://ghersonsa.com)  
**LinkedIn**: [linkedin.com/in/gherson-sa](https://www.linkedin.com/in/gherson-sa/)
