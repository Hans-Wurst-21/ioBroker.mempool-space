<!--
    strg+k dann v
    Öffnet live Darstellung
-->

![Logo](admin/mempool-space.png)

# ioBroker.mempool-space

[![NPM version](https://img.shields.io/npm/v/iobroker.mempool-space.svg)](https://www.npmjs.com/package/iobroker.mempool-space)
[![Downloads](https://img.shields.io/npm/dm/iobroker.mempool-space.svg)](https://www.npmjs.com/package/iobroker.mempool-space)
![Number of Installations](https://iobroker.live/badges/mempool-space-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/mempool-space-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.mempool-space.png?downloads=true)](https://nodei.co/npm/iobroker.mempool-space/)

**Tests:** ![Test and Release](https://github.com/Hans-Wurst-21/ioBroker.mempool-space/workflows/Test%20and%20Release/badge.svg)

## mempool.space for ioBroker

### Experience the Bitcoin network up close in your home!

Live data from mempool.space WebSocket API.

Connect the bitcoin Network to your smarthome.

This adapter provides real-time Bitcoin network information using WebSocket connections to the mempool.space API. It offers a wide range of data points including price conversions, transaction fees, block information, and network statistics.

## Live data websocket

**Important: The adapter or mempool.space will never ask for your seed!**
**NEVER!**
**If you share your seed you will lose 100% of everything!**

### Features

1. **Real-time Data**: Utilizes WebSocket connections for live updates from the Bitcoin network.

2. **Price Conversions**:

    - Bitcoin to USD and EUR conversion rates
    - "Moscow Time" representation (Satoshis per USD/EUR)

3. **Transaction Fees**:

    - Fastest, Half-Hour, Hour, Economy, and Minimum fee rates

4. **Block Information**:

    - Latest block height, hash, and timestamp
    - Time since last block
    - Mining pool that mined the last block

5. **Network Statistics**:

    - Average block time
    - Current and previous difficulty adjustments
    - Estimated time until next difficulty adjustment
    - Estimated time until next halving

6. **Mempool Information**:
    - Number of unconfirmed transactions

### Configuration

In the adapter settings, you can configure the following option:

-   **WebSocket URL**: The URL for the mempool.space WebSocket API (default: wss://mempool.space/api/v1/ws)

### States

The adapter creates automatically the following channels and states:

-   **conversion**

    -   usd: Bitcoin to USD conversion rate
    -   eur: Bitcoin to EUR conversion rate
    -   moscowtimeUSD: Moscow-Time USD
    -   moscowtimeEUR: Moscow-Time EUR
    -   timestamp: Timestamp of the last conversion update

-   **fees**

    -   fastest: Fastest transaction fee rate
    -   halfHour: Fee rate for confirmation within half an hour
    -   hour: Fee rate for confirmation within an hour
    -   economy: Economy fee rate
    -   minimum: Minimum fee rate

-   **block**

    -   height: Height of the latest block
    -   hash: Hash of the latest block
    -   timestamp: Timestamp of the latest block
    -   miningPool: Name of the pool that mined the last block
    -   timeSinceLastBlock: Time elapsed since the last block

-   **network**

    -   averageBlockTime: Average Blocktime
    -   difficultyChange: Current difficulty adjustment (in percent)
    -   previousDifficultyChange: Previous difficulty adjustment (in percent)
    -   nextDifficultyAdjustment: Estimated timestamp of the next difficulty adjustment
    -   remainingTimeToDifficulty: Remaining time until the next difficulty adjustment
    -   remainingTimeToHalving: Remaining time until the next halving

-   **mempool**

    -   transactionCount: Number of unconfirmed transactions in the mempool

-   **status**
    -   websocketConnection: Indicates if the WebSocket connection is active

## Changelog

### 0.0.1

-   (Hans-Wurst-21) initial release

## To-do

-   [ ] Query of user-defined addresses
-   [ ] Query of user-defined transactions

## Special Thanks

A special thanks to einundzwanzig.space
**Plebs together strong!**
**Not your keys, not your coin!**

## License

MIT License

Copyright (c) 2024 Hans-Wurst-21 <github+mempool-space@hansmail.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
