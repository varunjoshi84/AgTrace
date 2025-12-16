const EventEmitter = require('events');
class SupplyChainEmitter extends EventEmitter {}
const eventBus = new SupplyChainEmitter();
module.exports = eventBus;
