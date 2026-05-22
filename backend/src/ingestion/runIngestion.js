import { fetchTrials } from "./fetchTrial.js";
import { normalizeTrial } from "./normalizeTrial.js";
import { saveTrial } from "./saveTrial.js";

async function runIngestion() {
  let nextPageToken = null;
  let total = 0;

  do {
    console.log("Fetching page...");

    const data = await fetchTrials(nextPageToken);

    const studies = data.studies || [];

    for (const study of studies) {
      try {
        const normalized = normalizeTrial(study);

        await saveTrial(normalized);

        total++;

        console.log(`Saved ${normalized.nctId}`);
      } catch (err) {
        console.error("Failed trial:", err.message || err);
      }
    }

    nextPageToken = data.nextPageToken || null;

    console.log("Next token:", nextPageToken);

  } while (nextPageToken);

  console.log(`Done. Total saved: ${total}`);
  process.exit(0);
}

runIngestion()