'use strict';

const utils = require('@iobroker/adapter-core');
const mempoolJS = require('@mempool/mempool.js');
const { DateTime } = require('luxon');

class MempoolSpace extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'mempool-space',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.ws = null;
        this.updateInterval = null;
    }

    async onReady() {
        this.log.info('mempool-space adapter is ready');
        const websocketUrl = this.config.websocketUrl || 'wss://mempool.space/api/v1/ws';
        this.initWebSocket(websocketUrl);
        this.updateInterval = this.setInterval(() => {
            this.updateTimeSinceLastBlock();
            this.updateRemainingTimes();
        }, 60000); // Aktualisiere jede Minute
    }

    initWebSocket(url) {
        this.log.info(`Initializing WebSocket connection to ${url}`);
        const {
            bitcoin: { websocket },
        } = mempoolJS({
            hostname: new URL(url).hostname,
        });
        this.ws = websocket.initServer({
            options: ['blocks', 'stats', 'mempool-blocks', 'live-2h-chart'],
        });
        this.ws.on('message', this.handleWebSocketMessage.bind(this));
        this.ws.on('error', this.handleWebSocketError.bind(this));
        this.ws.on('close', this.handleWebSocketClose.bind(this));
        this.ws.on('open', this.handleWebSocketOpen.bind(this));
        this.setState('info.connection', { val: false, ack: true });
    }

    handleWebSocketMessage(data) {
        try {
            const res = JSON.parse(data.toString());
            this.processConversionData(res);
            this.processFeeData(res);
            this.processBlockData(res);
            this.processNetworkData(res);
            this.processMempoolData(res);
        } catch (error) {
            this.log.error(`Error processing WebSocket message: ${error}`);
        }
    }

    processConversionData(data) {
        if (data.conversions) {
            this.setState('conversion.usd', { val: data.conversions.USD, ack: true });
            this.setState('conversion.eur', { val: data.conversions.EUR, ack: true });
            this.setState('conversion.timestamp', { val: data.conversions.time, ack: true });

            const satoshisPerBTC = 100000000;
            const moscowTimeUSD = Math.floor(satoshisPerBTC / data.conversions.USD);
            const moscowTimeEUR = Math.floor(satoshisPerBTC / data.conversions.EUR);

            const formatMoscowTime = (value) => {
                const strValue = value.toString().padStart(4, '0');
                return strValue.slice(0, 2) + ':' + strValue.slice(2);
            };

            const formattedMoscowTimeUSD = formatMoscowTime(moscowTimeUSD);
            const formattedMoscowTimeEUR = formatMoscowTime(moscowTimeEUR);

            this.setState('conversion.moscowtimeUSD', { val: formattedMoscowTimeUSD, ack: true });
            this.setState('conversion.moscowtimeEUR', { val: formattedMoscowTimeEUR, ack: true });
        }
    }

    processFeeData(data) {
        if (data.fees) {
            this.setState('fees.fastest', { val: data.fees.fastestFee, ack: true });
            this.setState('fees.halfHour', { val: data.fees.halfHourFee, ack: true });
            this.setState('fees.hour', { val: data.fees.hourFee, ack: true });
            this.setState('fees.economy', { val: data.fees.economyFee, ack: true });
            this.setState('fees.minimum', { val: data.fees.minimumFee, ack: true });
        }
    }

    processBlockData(data) {
        if (data.block) {
            this.setState('block.height', { val: Number(data.block.height), ack: true });
            this.setState('block.hash', { val: data.block.id, ack: true });
            this.setState('block.timestamp', { val: data.block.timestamp, ack: true });
            this.updateTimeSinceLastBlock();
            if (data.block.extras && data.block.extras.pool) {
                this.setState('block.miningPool', { val: data.block.extras.pool.name, ack: true });
            }
        }
    }

    processNetworkData(data) {
        if (data.da) {
            // Durchschnittliche Blockzeit
            if (data.da.timeAvg) {
                const avgBlockTimeMinutes = data.da.timeAvg / 60; // Umrechnung von Sekunden in Minuten
                const roundedMinutes = Math.round(avgBlockTimeMinutes / 100) / 10; // Runden auf eine Dezimalstelle
                this.setState('network.averageBlockTime', { val: roundedMinutes, ack: true });
            }
            if (data.da.difficultyChange) {
                const roundedDifficultyChange = Math.round(data.da.difficultyChange * 100) / 100;
                this.setState('network.difficultyChange', { val: roundedDifficultyChange, ack: true });
            }
            if (data.da.previousRetarget) {
                const roundedPreviousDifficultyChange = Math.round(data.da.previousRetarget * 100) / 100;
                this.setState('network.previousDifficultyChange', { val: roundedPreviousDifficultyChange, ack: true });
            }
            if (data.da.estimatedRetargetDate) {
                this.setState('network.nextDifficultyAdjustment', { val: data.da.estimatedRetargetDate, ack: true });
            }
        }
        this.updateRemainingTimes();
    }

    processMempoolData(data) {
        if (data.mempoolInfo) {
            this.setState('mempool.transactionCount', { val: data.mempoolInfo.size, ack: true });
            if (data.mempoolInfo.vsize) {
                const vsizeMB = data.mempoolInfo.vsize / 1000000;
                this.setState('mempool.size', { val: Math.round(vsizeMB * 100) / 100, ack: true });
            }
        }
    }

    updateTimeSinceLastBlock() {
        this.getState('block.timestamp', (err, state) => {
            if (!err && state && state.val) {
                const lastBlockTimestamp = state.val;
                const currentTime = Math.floor(Date.now() / 1000);
                const elapsedTime = currentTime - Number(lastBlockTimestamp);
                const minutesPassed = Math.floor(elapsedTime / 60);
                const timeSinceLastBlock = `vor ${minutesPassed} Minuten`;
                this.setState('block.timeSinceLastBlock', { val: timeSinceLastBlock, ack: true });
            }
        });
    }

    updateRemainingTimes() {
        this.getState('network.nextDifficultyAdjustment', (err, state) => {
            if (!err && state && state.val) {
                const nextDifficultyAdjustment = DateTime.fromMillis(state.val);
                const now = DateTime.now();
                const remainingDays = nextDifficultyAdjustment.diff(now, 'days').days;
                const formattedDays = remainingDays.toFixed(1);
                this.setState('network.remainingTimeToDifficulty', { val: `in ${formattedDays} Tagen`, ack: true });
            }
        });

        this.getState('block.height', (err, state) => {
            if (!err && state && typeof state.val === 'number') {
                const currentBlockHeight = state.val;
                const nextHalvingBlock = Math.ceil(currentBlockHeight / 210000) * 210000;
                const blocksUntilHalving = nextHalvingBlock - currentBlockHeight;
                const minutesUntilHalving = blocksUntilHalving * 10;
                const now = DateTime.now();
                const halvingDate = now.plus({ minutes: minutesUntilHalving });
                const duration = halvingDate.diff(now, ['years', 'days']);
                const years = Math.floor(duration.years);
                const days = Math.floor(duration.days);
                this.setState('network.remainingTimeToHalving', {
                    val: `in ${years} Jahren, ${days} Tagen`,
                    ack: true,
                });
            }
        });
    }

    handleWebSocketError(error) {
        this.log.error(`WebSocket error: ${error}`);
        this.setState('info.connection', { val: false, ack: true });
    }

    handleWebSocketClose() {
        this.log.info('WebSocket connection closed');
        this.setState('info.connection', { val: false, ack: true });
    }

    handleWebSocketOpen() {
        this.log.info('WebSocket connection opened');
        this.setState('info.connection', { val: true, ack: true });
    }

    onUnload(callback) {
        try {
            if (this.ws) {
                this.ws.close();
                this.log.info('WebSocket connection closed');
                this.setState('info.connection', { val: false, ack: true });
            }
            if (this.updateInterval) {
                this.clearInterval(this.updateInterval);
            }
            callback();
        } catch (e) {
            this.log.error(`Error during unload: ${e}`);
            callback();
        }
    }
}

if (require.main !== module) {
    module.exports = (options) => new MempoolSpace(options);
} else {
    new MempoolSpace();
}
