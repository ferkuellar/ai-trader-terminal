# Auditoría Fase Markets Realtime — Movimiento en vivo rojo/verde

## 1. Auditoría inicial

* la sección Markets ya mostraba tabla estilo CoinMarketCap;
* faltaba movimiento visual en tiempo real;
* faltaba conexión live a datos públicos;
* los precios no indicaban si subían o bajaban por tick;
* la mejora debe mantener carácter educativo;
* no debe ejecutar trades;
* no debe usar APIs privadas.

## 2. Plan técnico

* creación de adapter WebSocket público de Binance;
* creación de hook `useRealtimeMarkets`;
* batching de updates para evitar renders excesivos;
* integración con MarketsSection;
* flash rojo/verde por movimiento;
* indicador de conexión y latencia;
* manejo de reconexión;
* conservación de datos base para market cap, supply y sparkline.

## 3. Archivos creados

```text
src/lib/realtime/binance-market-stream.js
src/hooks/useRealtimeMarkets.js
src/components/markets/MarketConnectionStatus.jsx
docs/audits/auditoria-fase-markets-realtime.md
```

## 4. Archivos modificados

```text
src/components/markets/MarketsSection.jsx
src/components/markets/MarketsTable.jsx
```

## 5. Implementación

* Se conecta al WebSocket público combinado de Binance Spot con streams `symbol@ticker`.
* Los tickers se normalizan a `{ symbol, price, change24hPct, quoteVolume24h, eventTime, source }`.
* La dirección `up/down/flat` se calcula comparando el precio anterior de la fila con el precio recibido.
* La latencia aproximada se calcula como `Date.now() - eventTime`.
* El batching acumula ticks en un `ref` y hace flush al estado cada 250 ms.
* La celda de precio y la fila hacen flash verde o rojo durante una ventana breve.
* `marketCap` y `circulatingSupply` se conservan desde la base previa; `marketCap` se recalcula con el precio realtime cuando hay supply.
* No se agregó ejecución real de trades, órdenes, APIs privadas ni secretos.

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
Markets carga correctamente
WebSocket conecta
Estado muestra Live
Latencia visible
BTCUSDT actualiza precio
ETHUSDT actualiza precio
Precio subiendo ilumina verde
Precio bajando ilumina rojo
Flash desaparece después de un periodo corto
Tabla no parpadea completa de forma agresiva
No hay freeze de UI
Reconexión funciona
Si WS falla, tabla conserva datos
Market Cap se conserva
Circulating Supply se conserva
Sparkline no se rompe
No hay ejecución de trades
No hay API keys privadas
```

## 7. Riesgos

* WebSocket público puede desconectarse.
* La latencia depende de red, navegador y Binance.
* Binance ticker no proporciona market cap ni circulating supply.
* Sparkline 7d no representa streaming histórico completo.
* El flash rojo/verde representa el último movimiento de precio, no una señal de compra/venta.
* Muchos símbolos pueden aumentar render cost si no se controla batching.
* La sección es informativa y educativa, no recomendación financiera.
* No ejecuta trades.

## 8. Auditoría final

* Markets ahora tiene movimiento live;
* los precios se iluminan rojo/verde según dirección;
* se agregó indicador de conexión y latencia;
* se usó WebSocket público;
* se evitó ejecución real;
* no se agregaron secretos;
* la implementación quedó preparada para mejorar fuentes de datos en el futuro.

## 9. Enunciado del commit

```text
feat(markets): add realtime public websocket price movement
```
