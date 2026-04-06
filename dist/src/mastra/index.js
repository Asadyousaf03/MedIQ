"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mastra = void 0;
const core_1 = require("@mastra/core");
const pg_1 = require("@mastra/pg");
const mediBotAgent_1 = require("./agents/mediBotAgent");
exports.mastra = new core_1.Mastra({
    agents: {
        mediBotAgent: mediBotAgent_1.mediBotAgent,
    },
    storage: new pg_1.PostgresStore({
        id: 'medibot-storage',
        connectionString: process.env.POSTGRES_CONNECTION_STRING,
    }),
});
//# sourceMappingURL=index.js.map