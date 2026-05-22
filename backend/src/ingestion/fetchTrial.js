const BASE_URL = "https://clinicaltrials.gov/api/v2/studies";

export async function fetchTrials(pageToken = null) {
    const params = new URLSearchParams({
        "query.term": "cancer",
        pageSize: "100",
        format: "json",
    });

    if (pageToken) {
        params.append("pageToken", pageToken);
    }

    const url = `${BASE_URL}?${params.toString()}`;

    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    return await res.json();
}