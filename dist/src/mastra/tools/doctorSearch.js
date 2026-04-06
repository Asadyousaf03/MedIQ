"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDoctorsTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const db_1 = require("../../lib/db");
exports.searchDoctorsTool = (0, tools_1.createTool)({
    id: "search-doctors",
    description: "Search for doctors based on specialty or condition",
    inputSchema: zod_1.z.object({
        specialty: zod_1.z.string().optional().describe("The medical specialty to search for (e.g. Cardiology, Pediatrics)"),
        condition: zod_1.z.string().optional().describe("The patient condition to match with a specialist"),
    }),
    outputSchema: zod_1.z.object({
        doctors: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.number(),
            name: zod_1.z.string(),
            specialty: zod_1.z.string(),
            hospital: zod_1.z.string(),
            bio: zod_1.z.string()
        }))
    }),
    execute: async ({ specialty, condition }) => {
        let sql = 'SELECT * FROM doctors';
        const params = [];
        if (specialty) {
            sql += ' WHERE lower(specialty) LIKE $1';
            params.push(`%${specialty.toLowerCase()}%`);
        }
        else if (condition) {
            sql += ' WHERE lower(bio) LIKE $1 OR lower(specialty) LIKE $1';
            params.push(`%${condition.toLowerCase()}%`);
        }
        sql += ' LIMIT 5';
        try {
            const res = await (0, db_1.query)(sql, params);
            return { doctors: res.rows };
        }
        catch (e) {
            console.error(e);
            return { doctors: [] };
        }
    }
});
//# sourceMappingURL=doctorSearch.js.map