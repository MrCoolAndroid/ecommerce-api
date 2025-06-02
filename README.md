# API de E-commerce
Este proyecto es una API RESTful para la gestión de un sistema de e-commerce, desarrollada con Node.js, Express y MongoDB. Permite la administración de usuarios, productos y pedidos, incluyendo autenticación JWT y validaciones.

### Tabla de Contenidos
- [Instalación](#instalacion)
- [Ejecución con Docker](#ejecucion-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
  - [Usuarios](#usuarios)
  - [Productos](#productos)
  - [Pedidos](#pedidos)
- [Autenticación](#autenticacion)
- [Testing](#testing)

## Instalación
1.	Clona el repositorio.
2.	Instala las dependencias: `npm install`
3.	Crea un archivo .env con las variables necesarias (ver ejemplo en docker-compose.yml).

## Ejecución con Docker
Puedes levantar el entorno completo usando Docker y Docker Compose, antes de ello deberás proporcionar un JWT token en docker-compose.yml:

`docker-compose up --build`

Esto levantará dos servicios:
- api: La API Node.js en el puerto 3000.
- mongo: Base de datos MongoDB en el puerto 27017.

## Estructura del Proyecto
- **app.js:** Punto de entrada de la aplicación. Configura middlewares, rutas y la conexión a MongoDB.
- **src/controllers/:** Lógica de negocio para usuarios, productos y pedidos.
- **src/services/generateToken.js:** Generación de tokens JWT para autenticación.
- **src/routes/:** Definición de rutas para cada recurso.
- **src/models/:** Modelos de datos de Mongoose.
- **src/middlewares/:** Middlewares personalizados para manejo de errores y respuestas.

## Endpoints Principales
### Usuarios
- POST /api/register

Registro de usuario. Requiere: name, email, password, role (opcional).

- POST /api/login

Login de usuario. Devuelve un token JWT.

### Productos
- GET /api/products

Lista todos los productos.

- POST /api/products

Crea un producto (requiere autenticación y permisos).

- PUT /api/products/:id

Actualiza un producto.

- DELETE /api/products/:id

Elimina un producto.

### Pedidos
- GET /api/orders

Lista pedidos del usuario autenticado o todos si es admin.

- POST /api/orders

Crea un pedido.

- PUT /api/orders/:id

Actualiza el estado de un pedido.

## Autenticación
La autenticación se realiza mediante JWT.
Al registrarse o iniciar sesión, se devuelve un token que debe enviarse en el header Authorization para acceder a rutas protegidas.
El token se genera en src/services/generateToken.js usando los datos del usuario y la clave secreta definida en la variable de entorno JWT_SECRET.

## Testing
El proyecto incluye tests para usuarios, productos y pedidos (ver carpeta src/tests/).
Puedes ejecutar los tests con: `npm test`

