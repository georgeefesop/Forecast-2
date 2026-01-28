import { db } from "../lib/db/client";

async function listVenues() {
    const result = await db.query("SELECT id, name, city FROM venues ORDER BY name");
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
}

listVenues().catch(console.error);
