# Cómo llevar ALGORITMOS de Drive a GitHub

1. Descarga la carpeta ALGORITMOS desde Drive (clic derecho → Descargar) y descomprímela, por ejemplo en `C:\Proyectos\algoritmos`.
2. Crea un repositorio vacío en https://github.com/new (nombre sugerido: `beto-algoritmos`, sin README).
3. En una terminal dentro de la carpeta:

```bash
git init
git add .
git commit -m "Beto y los Algoritmos: versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/beto-algoritmos.git
git push -u origin main
```

4. Probar localmente: `python3 -m http.server 8000` y abrir http://localhost:8000
5. Pruebas del simulador: `node tests/core.test.js`
6. Publicar gratis: en GitHub → Settings → Pages → Branch `main` / root. El avance de los niños se guarda en cada navegador.
