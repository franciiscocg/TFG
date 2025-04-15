FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar un servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer el puerto que utilizará la aplicación
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["serve", "-s", "build", "-l", "3000"]
