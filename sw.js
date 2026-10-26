// ============================================================================
// SERVICE WORKER
// Un pequeño programa que el celular deja corriendo "detrás" de la app.
// Su trabajo acá: guardar copia de los archivos para que la app abra
// aunque no haya internet.
// ============================================================================

// Nombre de la copia guardada. Si cambiás index.html y no ves los cambios
// en el celular, subí el número (fg-v2, fg-v3...) para forzar la actualización.
const CACHE = "fg-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALAR: la primera vez, descarga y guarda todos los archivos
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// ACTIVAR: borra copias viejas de versiones anteriores
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// CADA PEDIDO: primero intenta con internet (así siempre ves la versión nueva);
// si falla, usa la copia guardada.
self.addEventListener("fetch", (e) => {
  // Los envíos (POST) al Google Form pasan directo, no los tocamos
  if (e.request.method !== "GET") return;
  // Solo manejamos archivos de nuestra propia app
  if (new URL(e.request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(e.request))
  );
});
