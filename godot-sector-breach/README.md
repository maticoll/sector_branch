# Sector Breach Godot

Nueva base del juego en Godot 4.

## Por que migrar

El prototipo Three.js sirve como referencia, pero el juego ya necesita cosas que un motor resuelve mejor:

- FPS controller y fisicas estables.
- Mapas 3D con colisiones y navegacion.
- Bots con `NavigationAgent3D`.
- Armas como escenas/modelos separados.
- Skins con materiales/texturas.
- Export web y desktop desde el mismo proyecto.

## Como abrir

1. Instalar Godot 4.x desde https://godotengine.org/download.
2. Abrir Godot.
3. Importar esta carpeta: `godot-sector-breach`.
4. Ejecutar `scenes/main.tscn`.

## Export web para Vercel

El preset `Web` exporta a `godot-sector-breach/export/web/index.html`.

Comando local:

```powershell
godot --headless --path . --export-release Web export/web/index.html
```

Para Vercel, configurar el proyecto apuntando a la carpeta exportada versionada:

- Root/output estático: `godot-sector-breach/export/web`
- Framework: Other
- Build command: vacío si el export ya está generado localmente
- Output directory: `.`

`vercel.json` incluye headers COOP/COEP para builds WebAssembly de Godot.

Nota: Godot 4 Web requiere WebGL2. Si un navegador embebido muestra `WebGL2 missing`, probar en Chrome/Edge normal o revisar aceleracion por hardware.

## Estado actual

- Escena principal inicial.
- Player FPS con mouse look, movimiento, salto, disparo, recarga y cambio 1/2.
- Mapa blockout con colisiones.
- Bots con `NavigationAgent3D` preparado.
- Armas procedurales con skins originales.

## Proximos pasos

- Agregar `NavigationRegion3D` y navmesh horneado del mapa.
- Reemplazar bots procedurales por GLB CC0 o modelos propios.
- Reemplazar viewmodels por armas GLB CC0/originales.
- Implementar bomba, buy phase, rondas y equipos completos.
- Crear export presets para Web y Windows cuando Godot este instalado.
