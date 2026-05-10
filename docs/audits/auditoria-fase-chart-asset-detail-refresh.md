# Auditoría Fase Chart Asset Detail Refresh — Gráfico dinámico, sentimiento y ficha del par

## 1. Auditoría inicial

* la sección Chart necesitaba un refresh visual;
* faltaba conectar el gráfico al par seleccionado en Markets;
* faltaba Community Sentiment Graph;
* faltaban datos detallados tipo CoinMarketCap/CoinGecko;
* faltaban links del proyecto/token;
* la mejora es informativa y educativa;
* no implica ejecución de trades.

## 2. Plan técnico

* creación/refactor de `AssetChartSection`;
* creación de gráfico dinámico por par;
* creación de selector de temporalidad;
* creación de `CommunitySentimentGraph`;
* creación de `AssetLinksPanel`;
* creación de `AssetMarketDetails`;
* creación de adapters/formatters;
* integración con selección desde Markets;
* uso de mock/profile data cuando no exista API real.

## 3. Archivos creados

```text
src/components/chart/AssetChartSection.jsx
src/components/chart/DynamicPairChart.jsx
src/components/chart/ChartTimeframeSelector.jsx
src/components/chart/CommunitySentimentGraph.jsx
src/components/chart/AssetLinksPanel.jsx
src/components/chart/AssetMarketDetails.jsx
src/lib/asset-profile-data.js
src/lib/chart-data-adapter.js
src/lib/asset-formatters.js
docs/audits/auditoria-fase-chart-asset-detail-refresh.md
```

## 4. Archivos modificados

```text
components/TradingTerminal.jsx
src/components/markets/MarketsTable.jsx
src/components/markets/MarketsSection.jsx
```

## 5. Implementación

* Markets selecciona el par mediante `onSelectSymbol`, actualiza `selectedSymbol` y navega a Chart.
* Chart recibe `selectedSymbol` desde `TradingTerminal` y lo pasa a `AssetChartSection`.
* El gráfico cambia por temporalidad usando `ChartTimeframeSelector` y `getChartDataForPair`.
* `CommunitySentimentGraph` renderiza bullish/bearish, barra y mini tendencia con datos sample.
* `AssetLinksPanel` muestra Website, Whitepaper, Socials, CertiK, Explorers, Wallets y UCID con links externos seguros.
* `AssetMarketDetails` muestra market cap, volumen, Vol/Mkt Cap, FDV y supply.
* La data local vive en `asset-profile-data`; el adapter vive en `chart-data-adapter`; los formatters viven en `asset-formatters`.
* Se mantiene el botón `ANALIZAR` y el bloque `ANÁLISIS RÁPIDO`.
* No se agregó ejecución real, órdenes, API privada ni secretos.

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
Seleccionar BTCUSDT en Markets actualiza Chart
Seleccionar ETHUSDT en Markets actualiza Chart
Seleccionar SOLUSDT en Markets actualiza Chart
Timeframe 1H funciona
Timeframe 24H funciona
Timeframe 7D funciona
Timeframe 30D funciona
Timeframe 90D funciona
Community Sentiment visible
Website visible
Whitepaper visible
Socials visible
Rating CertiK visible o N/A
Explorers visible
Wallets visible
UCID visible
Market Cap visible
Volume 24h visible
Vol/Mkt Cap visible
FDV visible
Total Supply visible
Max Supply visible
Circulating Supply visible
Treasury Holdings visible o N/A
Mobile no se rompe
Desktop se ve profesional
No hay ejecución de trades
No hay API keys privadas
```

## 7. Riesgos

* Algunos datos pueden ser mock/local profile data si no existe API pública conectada.
* Binance no proporciona directamente market cap, supply, FDV, UCID o CertiK rating.
* CertiK rating puede requerir fuente externa o carga manual.
* Community sentiment puede ser simulado hasta conectar fuente real.
* Links externos pueden cambiar con el tiempo.
* El gráfico puede usar datos mock hasta conectar histórico real.
* La sección es educativa e informativa, no recomendación financiera.
* No ejecuta trades.

## 8. Auditoría final

* Chart ahora responde al par seleccionado en Markets;
* se agregó gráfico dinámico con temporalidades;
* se agregó sentimiento comunitario;
* se agregó ficha informativa del proyecto/token;
* se agregaron métricas detalladas;
* se mantiene separación limpia entre UI, datos y formatters;
* no se agregaron secretos;
* no se agregó ejecución real de trades.

## 9. Enunciado del commit

```text
feat(chart): add dynamic asset detail panel with sentiment and market profile
```
