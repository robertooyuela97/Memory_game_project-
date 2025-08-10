Memory Game
Descripción del Proyecto


Memory Game es un juego web interactivo desarrollado como parte de un proyecto de la asignatura Arquitectura de Computadoras. El objetivo principal es demostrar la aplicación de principios de arquitectura de software moderna y buenas prácticas de desarrollo, utilizando Django para la lógica del backend y Docker para la orquestación del entorno.

El juego desafía a los jugadores a encontrar pares de cartas idénticas en un tablero de 4
times4 en el menor tiempo posible y con la menor cantidad de intentos. Incluye un sistema de autenticación de usuarios, diferentes niveles de dificultad y un perfil para seguir el progreso y las estadísticas del jugador.

Características Principales
Autenticación de Usuarios: Registro y inicio de sesión seguro para gestionar perfiles individuales.

Múltiples Niveles de Dificultad: Elige entre niveles Básico, Medio y Avanzado, cada uno con un límite de intentos y tiempo diferente.

Tablero de Juego Interactivo: Interfaz visual con temporizador, contador de intentos y retroalimentación de audio.

Persistencia de Datos: Las estadísticas y el historial de partidas se almacenan en una base de datos PostgreSQL.

Perfil de Usuario: Visualiza tu rendimiento, historial de partidas y evolución a lo largo del tiempo.

Despliegue Contenerizado: El proyecto utiliza Docker y Docker Compose para garantizar un entorno de desarrollo aislado y portable.

Tecnologías Utilizadas
Backend:

Django: Framework web de Python.

Django REST Framework: Para la creación de APIs.

Frontend:

HTML5, CSS3, JavaScript: Para la estructura, estilos y lógica del cliente.

Bootstrap: Para un diseño responsivo y moderno.

Base de Datos:

PostgreSQL: Sistema de gestión de bases de datos relacionales.

Orquestación:

Docker y Docker Compose: Para gestionar los servicios de la aplicación en contenedores.

Instalación y Configuración
Sigue estos pasos para ejecutar el proyecto localmente utilizando Docker.

Requisitos Previos
Git

Docker

Docker Compose

Pasos
Clonar el repositorio:

git clone https://github.com/robertooyuela97/Memory_game_project-
cd nombre-del-repositorio

Configurar las variables de entorno:
Crea un archivo .env en la raíz del proyecto. Este archivo debe contener las variables de entorno necesarias (por ejemplo, para la base de datos y Django).

Construir y levantar los contenedores:
Desde la raíz del proyecto, ejecuta el siguiente comando. Esto construirá las imágenes de Docker y pondrá en marcha los servicios (web y base de datos).

docker-compose up --build

Aplicar migraciones:
Una vez que los contenedores estén funcionando, accede al contenedor web y aplica las migraciones de la base de datos para crear las tablas necesarias.

docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate

Uso
Una vez que los contenedores estén en funcionamiento, puedes acceder a la aplicación en tu navegador web en la siguiente URL:

http://localhost:8000

Registro: Crea una nueva cuenta.

Inicio de Sesión: Accede con tus credenciales.

Juego: Selecciona un nivel y comienza a jugar.


