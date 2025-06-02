const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad
app.use(helmet());

// Habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Logger de peticiones HTTP
app.use(morgan('dev'));

// Conexión a MongoDB
connectDB();

// Middleware de errores y respuestas
const responseHandler = require("./src/middlewares/responseHandler");
const errorHandler = require("./src/middlewares/errorHandler");

// Importar rutas
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');

app.use(responseHandler);

// Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/', userRoutes);

app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
});