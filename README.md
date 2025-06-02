# API de E-commerce
Este proyecto es una API RESTful para la gesti�n de un sistema de e-commerce, desarrollada con Node.js, Express y MongoDB. Permite la administraci�n de usuarios, productos y pedidos, incluyendo autenticaci�n JWT y validaciones.

### Tabla de Contenidos
- [Instalaci�n](#instalacion)
- [Ejecuci�n con Docker](#ejecucion-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
  - [Usuarios](#usuarios)
  - [Productos](#productos)
  - [Pedidos](#pedidos)
- [Autenticaci�n](#autenticacion)
- [Testing](#testing)

## Instalaci�n
1.	Clona el repositorio.
2.	Instala las dependencias: `npm install`
3.	Crea un archivo .env con las variables necesarias (ver ejemplo en docker-compose.yml).

## Ejecuci�n con Docker
Puedes levantar el entorno completo usando Docker y Docker Compose, antes de ello deber�s proporcionar un JWT token en docker-compose.yml:

`docker-compose up --build`

Esto levantar� dos servicios:
- api: La API Node.js en el puerto 3000.
- mongo: Base de datos MongoDB en el puerto 27017.

## Estructura del Proyecto
- **app.js:** Punto de entrada de la aplicaci�n. Configura middlewares, rutas y la conexi�n a MongoDB.
- **src/controllers/:** L�gica de negocio para usuarios, productos y pedidos.
- **src/services/generateToken.js:** Generaci�n de tokens JWT para autenticaci�n.
- **src/routes/:** Definici�n de rutas para cada recurso.
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

Crea un producto (requiere autenticaci�n y permisos).

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

## Autenticaci�n
La autenticaci�n se realiza mediante JWT.
Al registrarse o iniciar sesi�n, se devuelve un token que debe enviarse en el header Authorization para acceder a rutas protegidas.
El token se genera en src/services/generateToken.js usando los datos del usuario y la clave secreta definida en la variable de entorno JWT_SECRET.

## Testing
El proyecto incluye tests para usuarios, productos y pedidos (ver carpeta src/tests/).
Puedes ejecutar los tests con: `npm test`

