Leslie Store — Documentación técnica

1. Descripción

Leslie Store es una aplicación web de comercio electrónico orientada a ropa urbana y streetwear. El proyecto combina una tienda pública con un panel administrativo y una capa de persistencia híbrida basada en Firebase/Firestore y almacenamiento local del navegador.

El repositorio está implementado principalmente con React 19, TypeScript, Vite 6 y Tailwind CSS 4.

2. Objetivos funcionales

La aplicación cubre dos áreas principales:

Tienda pública

Mostrar catálogo de productos.

Filtrar y buscar productos.

Consultar información detallada de cada prenda.

Seleccionar talla y cantidad.

Mantener un carrito persistente.

Construir outfits.

Mostrar combos, reseñas y contenido social.

Facilitar pedidos y consultas mediante WhatsApp.

Mostrar información de ubicación, horarios y envío.

Administración

Autenticar administradores.

Gestionar productos.

Gestionar categorías.

Administrar inventario y stock por talla.

Consultar y gestionar pedidos.

Consultar clientes.

Modificar datos de la tienda.

Mover registros a papelera y restaurarlos según el módulo.

3. Tecnologías y dependencias

Frontend

React ^19.0.1

React DOM ^19.0.1

TypeScript ~5.8.2

Vite ^6.2.3

Tailwind CSS ^4.1.14

Motion ^12.23.24

Lucide React ^0.546.0

Canvas Confetti ^1.9.4

Datos y autenticación

Firebase ^12.17.1

Firestore

Firebase Authentication

LocalStorage

SessionStorage

Otras dependencias presentes

@google/genai

Express

dotenv

tsx

esbuild

Algunas dependencias están incluidas en package.json aunque no necesariamente se utilizan directamente en el flujo principal del frontend actual.

4. Scripts disponibles

Definidos en package.json:

{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server.js",
  "lint": "tsc --noEmit"
}

Desarrollo

npm run dev

Vite se inicia en el puerto 3000.

Validación TypeScript

npm run lint

Build

npm run build

Preview

npm run preview

5. Instalación

5.1 Clonar repositorio

git clone https://github.com/kendallfwd-lab/Tienda-de-ropa-urbana-final.git
cd Tienda-de-ropa-urbana-final

5.2 Instalar dependencias

npm install

5.3 Variables de entorno

El repositorio incluye:

.env.example

Contenido actual:

GEMINI_API_KEY=

Crea un archivo .env local si necesitas configurar esa integración.

5.4 Iniciar proyecto

npm run dev


   
6. Componentes principales

App.tsx

Es el componente raíz de la aplicación. Coordina:

productos;

contenido de TikTok;

sesión administrativa;

carrito;

modales;

navegación entre secciones;

sincronización del carrito con localStorage;

carga inicial desde la capa de datos.

ProductCatalog.tsx

Responsable del catálogo y de la interacción principal con productos.

ProductDetailModal.tsx

Muestra información detallada, tallas, descripción y acciones del producto seleccionado.

CartDrawer.tsx

Gestiona la vista lateral del carrito y las cantidades de productos agregados.

OutfitBuilder.tsx

Permite construir combinaciones de prendas y agregar el resultado al flujo de compra.

OrderSection.tsx

Gestiona la captura de datos del pedido, envío y método de pago.

AdminPanelModal.tsx

Funciona como contenedor de los módulos administrativos.

7. Modelo de datos

Los tipos principales están definidos en src/types.ts.

Product

Incluye:

identificación;

nombre;

marca;

categoría;

precio CRC/USD;

imágenes;

tallas;

inventario por talla;

colores;

descripción;

características;

stock;

rating;

flags de producto destacado/nuevo/viral;

metadatos de papelera.

Order

Incluye:

cliente;

teléfono/correo;

dirección;

provincia/cantón;

tipo de envío;

método de pago;

artículos;

subtotal/total;

estado;

tracking;

fechas de creación/actualización.

Estados soportados:

Pendiente
Confirmado
Preparando
Enviado
Completado
Cancelado

Customer

Mantiene información básica del cliente, cantidad de pedidos, monto acumulado y fechas relevantes.

Category

Representa las categorías dinámicas del catálogo y soporta estado activo y papelera.

8. Persistencia de datos

La capa src/lib/storeService.ts implementa una estrategia híbrida.

Firestore

Se utiliza como almacenamiento remoto para colecciones como:

productos;

productos eliminados;

categorías;

categorías eliminadas;

pedidos;

pedidos eliminados;

contenido TikTok;

configuración de tienda.

LocalStorage

Sirve como fallback de disponibilidad y como persistencia local para diferentes módulos.

Ejemplos de claves utilizadas:

leslie_store_custom_products
leslie_store_trashed_products
leslie_store_custom_categories
leslie_store_custom_orders
leslie_store_custom_settings
leslie_store_cart

Flujo simplificado

Componente React
      │
      ▼
storeService.ts
  │       │
  │       └────────► LocalStorage
  │
  └────────────────► Firebase / Firestore

Si Firestore falla, varios métodos recuperan o conservan la información desde el almacenamiento local.

9. Firebase

La inicialización se encuentra en:

src/lib/firebase.ts

El archivo configura:

Firebase App;

Firestore;

Firebase Authentication;

operaciones de lectura/escritura;

configuración de long polling para mejorar compatibilidad con entornos de preview/iframe.

El proyecto carga la configuración desde:

firebase-applet-config.json

Antes de una publicación real, se recomienda revisar que el archivo no contenga información que deba tratarse como privada y confirmar que las reglas de Firestore sean adecuadas para producción.

10. Autenticación administrativa

La lógica se encuentra en:

src/lib/authService.ts

Incluye:

inicio de sesión mediante Firebase Auth;

resolución de usuario/correo;

persistencia de sesión;

fallback de autenticación usando la capa de datos/local;

hashing SHA-256 para comprobaciones locales;

cierre de sesión;

recuperación de contraseña.

Recomendación para producción

No utilizar almacenamiento local como autoridad definitiva de seguridad. En una versión productiva, la autenticación y autorización deben validarse en un backend confiable o mediante reglas/claims de Firebase correctamente configuradas.

11. Catálogo inicial

Los datos iniciales de la tienda se encuentran en:

src/data/storeData.ts

Incluyen:

productos;

categorías;

marcas;

información general de la tienda;

opciones de envío;

datos para diferentes secciones de contenido.

Las imágenes se encuentran en:

public/images/

12. Flujo del carrito

El carrito se mantiene en el estado de React y se sincroniza automáticamente con:

localStorage -> leslie_store_cart

Cada línea del carrito utiliza una combinación del producto y talla para construir un identificador de ítem.

Funciones principales desde App.tsx:

agregar producto;

actualizar cantidad;

eliminar producto;

vaciar carrito;

continuar al pedido.

13. Flujo de compra por WhatsApp

La aplicación puede construir un mensaje con:

nombre del producto;

marca;

talla;

cantidad;

total estimado.

El mensaje es codificado y enviado al enlace de WhatsApp configurado para la tienda.

14. Convenciones recomendadas para Git

Crear rama

git switch -c feature/nombre-de-la-funcionalidad

Ver cambios

git status

Guardar cambios

git add .
git commit -m "feat: describe el cambio"

Subir rama

git push -u origin feature/nombre-de-la-funcionalidad

Ejemplos de commits

feat: add product inventory controls
fix: correct cart quantity synchronization
refactor: simplify store service persistence
style: improve responsive product cards
docs: update project readme

15. Checklist antes de hacer push

npm install
npm run lint
npm run build
git status

Comprobar además:

que no existan claves privadas en .env;

que el proyecto compile sin errores;

que las imágenes referenciadas existan;

que Firestore tenga reglas adecuadas;

que las nuevas funciones funcionen también con recarga de página.

16. Repositorio

https://github.com/kendallfwd-lab/Tienda-de-ropa-urbana-final

Rama principal detectada:

main

17. Estado técnico actual

El repositorio contiene una base funcional de e-commerce con:

experiencia pública completa;

catálogo local inicial;

Firestore;

autenticación administrativa;

panel de administración modular;

persistencia local;

integración con WhatsApp;

recursos visuales propios dentro de public/images.

Para una salida a producción se recomienda realizar una revisión adicional de seguridad, reglas de Firestore, autenticación, manejo de secretos, validación de formularios y estrategia de despliegue.
