# FPS tactico web - guia de replicacion

Este documento resume todo lo implementado hasta ahora para que otro chat o desarrollador pueda replicarlo dentro de un proyecto HTML/CSS/JavaScript con Three.js.

## Objetivo

Convertir un prototipo FPS web en un shooter tactico 3D de navegador, original, inspirado en mecanicas generales de shooters competitivos, sin copiar nombres, mapas, sonidos, armas, logos ni assets protegidos.

Archivos principales:

- `index.html`
- `style.css`
- `main.js`

No se agregaron assets locales nuevos. El proyecto usa Three.js desde CDN y genera visuales/sonidos de forma procedural, con fallback para modelos.

## Estado actual

El juego tiene:

- Pantalla inicial.
- Pointer Lock para mouse look.
- Rig FPS 3D real.
- Movimiento WASD segun la direccion real de la camara.
- Sprint/caminar lento con `Shift`.
- Crouch con `Ctrl`.
- Salto con gravedad.
- Colisiones basicas contra paredes/obstaculos.
- Raycasting desde el centro real de la camara.
- Armas ficticias con stats.
- Recoil, spread dinamico y crosshair dinamico.
- Arma en primera persona con sway, recoil, recarga y muzzle flash.
- Rondas.
- Fase de compra.
- Economia.
- Bots con estados tacticos.
- Danio por zonas: cabeza, torso y piernas.
- Hit marker y headshot marker.
- Sonidos proceduralmente generados con Web Audio API.
- Mapa industrial tactico original con containers, coberturas, pasillos, luces y texturas procedurales.
- Renderer moderno con sombras, tone mapping y color space correcto.
- Loaders `GLTFLoader`, `RGBELoader` y `DRACOLoader` con fallback.
- Debug oculto con `F3`.

## Restricciones respetadas

No usar:

- Assets de juegos comerciales.
- Nombres asociados a Counter-Strike, CS:GO o Valve.
- Mapas reales.
- Sonidos comerciales.
- Modelos protegidos.
- Nombres exactos de armas protegidas.

Los nombres usados son ficticios:

- `P-9`
- `Viper SMG`
- `R-47`
- `Sentinel Rifle`
- `Longshot`

## Arquitectura FPS 3D

Se reemplazo la arquitectura vieja de camara por un rig FPS real:

```js
const playerObject = new THREE.Object3D();
const yawObject = new THREE.Object3D();
const pitchObject = new THREE.Object3D();

pitchObject.add(camera);
yawObject.add(pitchObject);
playerObject.add(yawObject);
scene.add(playerObject);
```

Responsabilidades:

- `playerObject`: posicion fisica del jugador en el mundo.
- `yawObject`: rotacion horizontal del jugador en eje Y.
- `pitchObject`: rotacion vertical de la camara en eje X.
- `camera`: camara de primera persona dentro de `pitchObject`.

El mouse nunca mueve la posicion del jugador. Solo rota yaw/pitch.

## Pointer Lock

La entrada de mouse usa Pointer Lock API:

- Click en pantalla o en la pantalla inicial pide `requestPointerLock()`.
- `pointerlockchange` actualiza `isPointerLocked`.
- `mousemove` solo rota la vista si Pointer Lock esta activo.
- `ESC` libera el mouse por comportamiento nativo del navegador.

Pitch limitado:

```js
pitchObject.rotation.x = clamp(
  pitchObject.rotation.x - event.movementY * sensitivity,
  -Math.PI / 2,
  Math.PI / 2
);
```

## Movimiento WASD 3D

El movimiento se calcula desde la direccion mundial de la camara:

```js
const forward = new THREE.Vector3();
camera.getWorldDirection(forward);
forward.y = 0;
forward.normalize();

const right = new THREE.Vector3();
right.crossVectors(forward, camera.up).normalize();
```

Luego:

- `W` suma `forward`.
- `S` resta `forward`.
- `D` suma `right`.
- `A` resta `right`.
- Se normaliza el vector final para evitar velocidad diagonal excesiva.
- El movimiento ocurre en XZ.
- Mirar arriba/abajo no hace subir/bajar al jugador.

## Fisica basica

Implementado:

- Altura humana aproximada: `1.65`.
- Gravedad simple.
- Salto con `Space`.
- Colision contra piso.
- Colision horizontal contra cajas/paredes usando `Box3`.
- Aceleracion/desaceleracion suave.
- Crouch reduce altura y velocidad.
- Shift activa movimiento lento/tactico.

## Disparo 3D real

El disparo sale desde la posicion mundial de la camara:

```js
const origin = camera.getWorldPosition(new THREE.Vector3());
const direction = new THREE.Vector3();
camera.getWorldDirection(direction);
raycaster.set(origin, direction);
```

Se aplica spread agregando pequenas variaciones al vector de direccion antes del raycast.

Impactos:

- Bots: reduce vida segun zona.
- Pared/obstaculo: crea particulas y marca visual.
- Trazadora visual por disparo.

## Sistema de armas

Las armas estan definidas en un objeto `WEAPONS`.

Cada arma tiene:

- `name`
- `damage`
- `fireDelay`
- `magazineSize`
- `reserveMags`
- `reloadTime`
- `baseSpread`
- `movingSpread`
- `runSpread`
- `jumpSpread`
- `recoilKick`
- `recoilHeat`
- `recoilRecovery`
- `automatic`
- `price`
- `type`

Armas actuales:

- `pistol`: P-9, gratis.
- `smg`: Viper SMG, barata para la primera ronda.
- `rifle`: R-47, rifle automatico.
- `sentinel`: Sentinel Rifle, rifle mas preciso.
- `sniper`: Longshot, sniper simple.

## Recoil y precision tactica

La precision depende de:

- Arma equipada.
- Velocidad del jugador.
- Si esta en el aire.
- Si esta agachado.
- Calor de recoil acumulado.

Reglas:

- Quieto = mas preciso.
- Caminando = menos preciso.
- Corriendo = mucho menos preciso.
- Saltando = muy impreciso.
- Crouch mejora precision.
- Disparar en automatico aumenta `recoilHeat`.
- `recoilHeat` se recupera gradualmente.

El crosshair usa una variable CSS:

```css
#hud {
  --spread: 11px;
}
```

Y JS actualiza esa variable segun el spread calculado.

## Arma en primera persona

El arma se construye con geometria simple pero mas viva:

- Grupo agregado a la camara.
- Cuerpo, barrel, grip, rail.
- Muzzle flash con cono.
- Idle sway.
- Head bob al caminar.
- Recoil visual hacia atras y arriba.
- Recarga con movimiento del arma.
- Cambio de arma.
- Sonidos distintos por tipo de arma.

## Bots

Estados:

- `PATROL`
- `ALERT`
- `ATTACK`
- `TAKE_COVER`
- `DEAD`

Comportamiento:

- Patrullan puntos.
- Detectan al jugador por distancia.
- Usan angulo de vision aproximado.
- Tienen delay de reaccion.
- Persiguen si ven al jugador.
- Disparan en rafagas.
- Tienen precision imperfecta.
- Buscan cobertura simple si estan heridos.
- Retroceden si estan muy cerca.
- No son demasiado dificiles.

Tipos:

- `easy`
- `medium`
- `aggressive`

## Modelos de enemigos

Se agrego sistema robusto de carga:

```js
function loadModel(url, onLoad, onError) {
  // Usa GLTFLoader + DRACOLoader.
  // Si falla, ejecuta fallback.
}
```

Actualmente no se depende de un asset externo obligatorio.

Fallback procedural:

```js
function createEnemyModelFallback(kind) {
  const group = new THREE.Group();
  // cuerpo, cabeza, brazos, piernas, arma, visor, muzzle flash
  return group;
}
```

El fallback incluye:

- Piernas.
- Torso.
- Chaleco.
- Cabeza.
- Brazos.
- Arma.
- Visor.
- Muzzle flash enemigo.
- Materiales con roughness/metalness.
- Sombras.

Cada parte tiene `userData.zone` para simular hitboxes.

## Danio por zonas

Zonas:

- `head`: multiplicador alto.
- `torso`: danio normal.
- `legs`: danio reducido.

Si se usa un modelo externo, se intenta detectar zona por nombre. Si no, se asigna por altura/posicion.

Feedback:

- Hit marker.
- Headshot marker.
- Sonido de impacto.
- Sonido de headshot.
- Particulas.
- Muerte con animacion simple.

## Mapa

El mapa se construye con `MapBuilder`.

Incluye:

- Piso industrial texturizado proceduralmente.
- Paredes con textura procedural.
- Containers con textura procedural.
- Cajas/coberturas.
- Barriles.
- Pasillos.
- Esquinas.
- Zona central.
- Choke points.
- Plataformas simples.
- Luces puntuales de color.
- Sombras.
- Fog sutil.
- Sky fallback.

Se removio la grilla visible para que el mapa no parezca una demo tecnica.

## Texturas y visuales

No se agregaron archivos de imagen.

Se generan texturas con canvas:

- `makeConcreteTexture()`
- `makeWallTexture()`
- `makeContainerTexture()`

Estas texturas se usan como `CanvasTexture` con `RepeatWrapping`.

Renderer:

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

## Loaders

Imports actuales:

```js
import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/RGBELoader.js";
import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js";
```

En `index.html` se agrego import map:

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    }
  }
</script>
```

Esto evita el error de browser:

```txt
Failed to resolve module specifier "three"
```

## Rondas

Estados:

- `MENU`
- `BUY_PHASE`
- `PLAYING`
- `ROUND_WIN`
- `ROUND_LOSE`
- `GAME_OVER`

Flujo:

1. Menu inicial.
2. Primera ronda.
3. Fase de compra.
4. Ronda activa.
5. Victoria si no quedan bots.
6. Derrota si vida llega a 0 o termina tiempo.
7. Boton para siguiente ronda.

## Economia

El jugador empieza con `$800`.

Puede comprar armas en fase de compra.

Dinero ganado:

- Victoria: recompensa mayor.
- Derrota: recompensa menor.
- Bajas: recompensa extra.

## HUD

Muestra:

- Vida.
- Arma actual.
- Municion.
- Creditos.
- Ronda.
- Marcador.
- Hostiles restantes.
- Timer.
- Fase actual.
- Crosshair dinamico.
- Hit marker.
- Headshot marker.
- Damage vignette.
- Toasts.
- Panel de compra.
- Debug oculto.

## Audio

Todos los sonidos son procedurales con Web Audio API.

Incluye:

- Disparo de pistola.
- Disparo de SMG/rifle.
- Disparo sniper.
- Disparo enemigo.
- Recarga.
- Click sin municion.
- Impacto.
- Headshot.
- Danio recibido.
- Muerte de bot.
- Inicio de ronda.
- Victoria.
- Derrota.
- Pasos.

## Debug

Tecla: `F3`.

Muestra:

- Posicion del jugador.
- Yaw.
- Pitch.
- Pointer Lock activo.
- Velocidad.
- Estado del juego.
- Cantidad de colliders.

## Comandos de verificacion usados

Sintaxis:

```bash
node --check main.js
```

Servidor local:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Verificacion HTTP:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:4173" -UseBasicParsing
```

URL:

```txt
http://127.0.0.1:4173
```

## Problemas encontrados y solucionados

### Pointer Lock + tienda

Problema:

Si el mouse queda capturado durante fase de compra, los botones de tienda son incomodos de usar.

Estado actual:

- Click inicial arranca la ronda y pide Pointer Lock.
- Tambien se puede comprar con teclas `1-5`.
- Si se quiere usar botones con mouse, liberar con `ESC` y hacer click en la tienda.

### Loaders de Three.js

Problema:

Los loaders importan `three` como bare specifier.

Solucion:

Agregar `importmap` en `index.html` y cambiar `main.js` a:

```js
import * as THREE from "three";
```

### Movimiento tipo 2D

Problema:

La version anterior usaba yaw directamente y no separaba bien cuerpo fisico/camara.

Solucion:

Crear `playerObject -> yawObject -> pitchObject -> camera` y mover `playerObject.position` usando `camera.getWorldDirection()` proyectado en XZ.

## Sugerencias para seguir mejorando

1. Agregar assets GLB propios o libres con licencia verificada.
2. Configurar `ASSETS.enemyModel` con una URL/local path a un GLB liviano.
3. Configurar `ASSETS.environmentHdr` con un HDRI libre.
4. Agregar navmesh simple para bots.
5. Agregar minimapa.
6. Mejorar colisiones con capsule-vs-AABB.
7. Separar `main.js` en modulos cuando el proyecto crezca.

## Archivos que debe tener el proyecto

Obligatorios:

```txt
index.html
style.css
main.js
```

No hay archivos extra obligatorios.

Opcionales si otro proyecto quiere usar assets reales:

```txt
assets/models/enemy.glb
assets/hdr/industrial.hdr
assets/textures/
```

Si se agregan, actualizar:

```js
const ASSETS = {
  enemyModel: "./assets/models/enemy.glb",
  environmentHdr: "./assets/hdr/industrial.hdr",
};
```

El juego debe seguir funcionando aunque esos assets fallen, gracias a los fallbacks.
