export async function buildContext(results){
    return results
                .map((trial, index) => {
                    const p = trial.payload; 

                    return `
                    Trial: 
                    ${index+1}

                    Title: 
                    ${p.title}

                    Conditions: 
                    ${p.conditions?.join(", ") || "N/A"}

                    Status: 
                    ${p.status}

                    Study Type: 
                    ${p.studyType}

                    Summary: 
                    ${p.searchDocument}

                    `;
                }).join("\n\n----------------\n\n")
}