# Auditoría Fase Markets Section — Tabla de mercado estilo CoinMarketCap

## 1. Auditoría inicial

* la sección Markets necesitaba mejor organización visual;
* faltaba una tabla completa tipo CoinMarketCap;
* se requerían columnas de precio, variaciones, market cap, volumen, supply y últimos 7 días;
* la mejora es visual y analítica;
* no implica ejecución de trades;
* no usa APIs privadas.

## 2. Plan técnico

* creación/refactor de `MarketsSection`;
* creación/refactor de `MarketsTable`;
* creación/refactor de `MarketSparkline`;
* creación de formatters;
* uso de datos mock o fuente pública existente;
* diseño responsive;
* separación entre datos, formato y UI.

## 3. Archivos creados

```text
src/components/markets/MarketsSection.jsx
src/components/markets/MarketsTable.jsx
src/components/markets/MarketSparkline.jsx
src/lib/markets-adapter.js
src/lib/market-formatters.js
docs/audits/auditoria-fase-markets-section.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
```

## 5. Implementación

* La tabla se renderiza desde `MarketsSection`, que carga datos públicos de Binance y delega el render a `MarketsTable`.
* Los precios se formatean con `formatCurrency`.
* Los porcentajes se formatean con `formatPercent`.
* Los colores positivo/negativo salen de `getPercentTone`.
* El sparkline de últimos 7 días usa `MarketSparkline` con `recharts` y datos de klines diarios de Binance.
* El responsive usa `overflow-x-auto` y una tabla con `min-w-[1120px]`.
* La lógica de datos vive en `src/lib/markets-adapter.js`; la lógica de formato vive en `src/lib/market-formatters.js`; la UI vive en `src/components/markets`.
* Binance spot entrega precio, volumen y klines. Market cap se estima con precio público de Binance multiplicado por supply estático documentado en el adapter, porque Binance spot no entrega circulating supply ni market cap.

## 6. Validación

Ejecutar:

```bash
npm run lint
npm run build
```

Resultado local:

```text
npm run lint: OK, con warnings preexistentes de react-hooks/exhaustive-deps.
npm run build: OK.
npm run test: no existe script de test en package.json.
```

Si hay tests:

```bash
npm run test
```

Validar manualmente:

```text
Markets section visible
Pair visible
Price visible
1h % visible
24h % visible
7d % visible
Market Cap visible
Volume 24h visible
Circulating Supply visible
Last 7 Days sparkline visible
Positive values green
Negative values red
Mobile has horizontal scroll
No horizontal overflow outside table wrapper
No execution/trading buttons added
No private API keys added
```

## 7. Riesgos

* Si se usan datos mock, no representan mercado real.
* Si se conecta fuente pública después, puede haber rate limits.
* Market cap y circulating supply no siempre están disponibles desde exchanges como Binance.
* Binance puede dar precio y volumen, pero no siempre supply/market cap.
* Para datos tipo CoinMarketCap reales puede requerirse API externa especializada.
* La sección es informativa y educativa, no recomendación financiera.
* No ejecuta trades.

## 8. Auditoría final

* la sección Markets quedó más profesional;
* se agregaron columnas clave tipo CoinMarketCap;
* la tabla es responsive;
* la lógica de formato quedó separada;
* no se agregaron llaves privadas;
* no se agregó ejecución real de trades;
* la mejora queda lista para conectar una fuente pública real en una fase posterior.

## 9. Enunciado del commit

```text
feat(markets): add CoinMarketCap-style market overview table
```
