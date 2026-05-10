# Setup

Estado del documento: Vigente  
Ultima actualizacion: 2026-05-10

## Requisitos

- Node.js LTS.
- npm.
- Git.
- VS Code recomendado.

## Instalacion

```powershell
cd D:\projects
git clone <repo-url>
cd tradingterminal
cd ai-trader-terminal/apps/web
npm install
npm run dev
```

## Verificacion

```powershell
npm run lint
npm run build
```

## Notas

El repo actual puede no tener `.git` inicializado en el workspace local. Confirmar con `git status` antes de crear ramas o commits.
