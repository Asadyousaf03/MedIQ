import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { query } from '../../lib/db';

export const searchDoctorsTool = createTool({
    id: "search-doctors",
    description: "Search for doctors based on specialty or condition",
    inputSchema: z.object({
        specialty: z.string().optional().describe("The medical specialty to search for (e.g. Cardiology, Pediatrics)"),
        condition: z.string().optional().describe("The patient condition to match with a specialist"),
    }),
    outputSchema: z.object({
        doctors: z.array(z.object({
            name: z.string(),
            specialty: z.string(),
            hospital: z.string(),
            bio: z.string()
        }))
    }),
    execute: async ({ specialty, condition }) => {
        let sql = 'SELECT * FROM doctors';
        const params: any[] = [];

        // Use the variables directly, not context.variable
        if (specialty) { 
            sql += ' WHERE lower(specialty) LIKE $1';
            params.push(`%${specialty.toLowerCase()}%`);
        } else if (condition) {
             sql += ' WHERE lower(bio) LIKE $1 OR lower(specialty) LIKE $1';
             params.push(`%${condition.toLowerCase()}%`);
        }

        sql += ' LIMIT 5';
        try {
           const res = await query(sql, params);
           return { doctors: res.rows };
        } catch(e) {
            console.error(e);
            return { doctors: [] };
        }
    }
});
