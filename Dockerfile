# Usa una imagen base de Python. Se recomienda especificar una versión.
FROM python:3.9-slim-buster

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo de requisitos e instala las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código de tu proyecto al contenedor
COPY . .

# Expone el puerto en el que correrá Django
EXPOSE 8000

# Comando para ejecutar el servidor Django cuando el contenedor se inicie
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]