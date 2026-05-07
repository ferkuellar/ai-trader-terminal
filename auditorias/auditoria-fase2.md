# Auditoria Fase 2 - AI Analyst individual

## 1. Auditoria inicial

Se reviso la integracion AI individual para analizar setups educativos desde la plataforma.

Los archivos clave fueron `app/api/ai/analyze/route.js`, `src/lib/ai-prompt.js`, `src/lib/ai-validation.js` y `components/TradingTerminal.jsx`.

## 2. Plan tecnico

- Mantener llamadas AI server-side.
- Usar `ANTHROPIC_API_KEY` solo en backend.
- Parsear y validar respuestas AI antes de enviarlas al cliente.
- Renderizar resultado educativo dentro del tab Analyst.
- Guardar resultados en `analyses` sin borrar datos previos.

## 3. Archivos creados

- `app/api/ai/analyze/route.js`
- `src/lib/ai-prompt.js`
- `src/lib/ai-validation.js`

## 4. Archivos modificados

- `components/TradingTerminal.jsx`
- `README.md` si se documento la API o variables de entorno.

## 5. Implementacion

Se implemento un flujo AI individual donde el cliente envia datos del setup al endpoint server-side.

El backend construye el prompt, llama a Anthropic, extrae JSON, valida payload y devuelve una respuesta estructurada para renderizar en la UI.

## 6. Validacion

- El endpoint `/api/ai/analyze` queda disponible.
- La llave `ANTHROPIC_API_KEY` no se expone al cliente.
- La UI contempla loading y error.
- El resultado puede persistirse en `analyses`.

## 7. Riesgos

- Validacion manual sin librerias externas.
- Dependencia de calidad de respuesta del LLM.
- El tab Analyst empezo a crecer dentro del monolito.

## 8. Auditoria final

La Fase 2 establecio el primer flujo AI util de la plataforma. La continuidad natural fue agregar comparacion crypto y watchlist scoring usando una metodologia de Composite Crypto Score.
