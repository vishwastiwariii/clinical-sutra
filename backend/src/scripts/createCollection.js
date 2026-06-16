import { ensureTrialCollection } from "./qdrantTrialStore.js";


async function createCollection(){
    try {
        const result = await ensureTrialCollection()
        console.log(`Collection ready: ${result.collection} (${result.created ? "created" : "existing"})`)

        return {
            success: true,
            ...result,
        }

    } catch (err) {
        throw new Error(`Collection creation failed: ${err.message}`);
    }
}

createCollection()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err.message)
        process.exit(1)
    })
