# Gestión de Productos — Full Stack App

Aplicación completa de gestión de productos con Node.js + Express + MySQL en el backend y React en el frontend.

---

## ¿Qué tiene este proyecto?

- **Backend:** API REST con Express y MySQL
- **Frontend:** React con React Router
- **Autenticación:** JWT con roles (admin / usuario)
- **Funciones:** CRUD de productos, paginación, filtros por nombre y categoría
- **API externa:** Tipo de cambio de monedas en tiempo real (gratuita, sin registro)
- **Despliegue:** Render (backend) + Render Static Sites (frontend)

---

## PARTE 1 — Configurar y correr en local

### Paso 1: Crear la base de datos en MySQL

Abre MySQL Workbench o la terminal de MySQL y ejecuta:

```sql
CREATE DATABASE productos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Eso es todo. Las tablas se crean automáticamente cuando inicias el servidor.

---

### Paso 2: Configurar el backend

1. Entra a la carpeta del backend:
```
cd backend
```

2. Instala las dependencias:
```
npm install
```

3. Crea el archivo `.env` (copia el ejemplo):
```
cp .env.example .env
```

4. Abre el archivo `.env` y pon tus datos de MySQL:
```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
DB_NAME=productos_db
JWT_SECRET=cualquier_cadena_larga_y_secreta_aqui_123
EXCHANGE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
FRONTEND_URL=http://localhost:5173
```

5. Inicia el servidor:
```
npm run dev
```

Deberías ver:
```
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en http://localhost:4000
```

6. Prueba que funcione abriendo en el navegador:
```
http://localhost:4000/api/health
```

---

### Paso 3: Configurar el frontend

Abre otra terminal (el backend debe seguir corriendo) y:

1. Entra a la carpeta del frontend:
```
cd frontend
```

2. Instala las dependencias:
```
npm install
```

3. Crea el archivo `.env`:
```
cp .env.example .env
```

El archivo `.env` del frontend ya viene con los valores correctos para desarrollo local, no necesitas cambiar nada.

4. Inicia el frontend:
```
npm run dev
```

Abre en el navegador: `http://localhost:5173`

---

### Paso 4: Crear tu primer usuario admin

Cuando te registres desde la app, tu cuenta será de tipo `usuario`. Para hacerla admin, ejecuta esto en MySQL:

```sql
USE productos_db;
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';
```

Después cierra sesión y vuelve a entrar. Ahora verás el enlace "Admin" en el menú.

---

## PARTE 2 — Despliegue en Render

### Paso 1: Subir tu código a GitHub

1. Crea un repositorio en GitHub (puede ser público o privado)
2. Desde la carpeta raíz del proyecto:

```
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

---

### Paso 2: Desplegar el backend en Render

1. Entra a https://render.com e inicia sesión con GitHub
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura así:
   - **Name:** productos-backend (o el nombre que quieras)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Más abajo, en **"Environment Variables"**, agrega:
   - `DB_HOST` → la IP o host de tu base de datos MySQL (ver nota abajo)
   - `DB_PORT` → `3306`
   - `DB_USER` → tu usuario
   - `DB_PASSWORD` → tu contraseña
   - `DB_NAME` → `productos_db`
   - `JWT_SECRET` → una cadena secreta larga
   - `EXCHANGE_API_URL` → `https://api.exchangerate-api.com/v4/latest/USD`
   - `FRONTEND_URL` → la URL de tu frontend en Render (la agregas después de desplegar el frontend)
6. Haz clic en **"Create Web Service"**

> **Nota sobre MySQL en Render:** Render no tiene MySQL gratis, pero puedes usar **Railway** (railway.app) que ofrece MySQL gratuito. Crea una base de datos ahí y usa sus credenciales. O puedes usar **PlanetScale** que también es gratuito y compatible con MySQL.

---

### Paso 3: Desplegar el frontend en Render

1. En Render, **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. En **"Environment Variables"** agrega:
   - `VITE_API_URL` → la URL de tu backend en Render (algo como `https://productos-backend.onrender.com/api`)
5. Haz clic en **"Create Static Site"**

---

### Paso 4: Actualizar la URL del frontend en el backend

Una vez que tengas la URL del frontend (algo como `https://productos-frontend.onrender.com`), vuelve al servicio de backend en Render, ve a "Environment" y actualiza:
- `FRONTEND_URL` → `https://tu-frontend.onrender.com`

Render reiniciará el servidor automáticamente.

---

## Estructura del proyecto

```
proyecto-productos/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       <- Conexión a MySQL
│   │   ├── middleware/
│   │   │   ├── auth.js           <- Verificación de JWT y roles
│   │   │   └── errorHandler.js   <- Manejo de errores y validaciones
│   │   ├── routes/
│   │   │   ├── auth.js           <- Login y registro
│   │   │   ├── productos.js      <- CRUD de productos
│   │   │   └── monedas.js        <- API externa de monedas
│   │   └── index.js              <- Servidor principal
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ModalProducto.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    <- Manejo de sesión global
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Catalogo.jsx       <- Página pública
    │   │   ├── Admin.jsx          <- Solo para admins
    │   │   └── Monedas.jsx        <- Conversor de monedas
    │   ├── App.jsx                <- Rutas de React Router
    │   ├── config.js              <- URL del backend
    │   └── index.css              <- Estilos globales
    ├── .env.example
    └── package.json
```

---

## Rutas de la API (para Postman)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | /api/health | Público | Verificar servidor |
| POST | /api/auth/registro | Público | Crear cuenta |
| POST | /api/auth/login | Público | Iniciar sesión |
| GET | /api/productos | Público | Listar con filtros y paginación |
| GET | /api/productos/:id | Público | Ver un producto |
| POST | /api/productos | Solo admin | Crear producto |
| PUT | /api/productos/:id | Solo admin | Editar producto |
| DELETE | /api/productos/:id | Solo admin | Eliminar producto |
| GET | /api/monedas | Público | Tasas de cambio actuales |
| GET | /api/monedas/convertir?cantidad=100&de=USD&a=MXN | Público | Convertir moneda |

Para las rutas protegidas en Postman, agrega el header:
```
Authorization: Bearer TU_TOKEN_AQUI
```

El token lo obtienes al hacer login en `/api/auth/login`.
