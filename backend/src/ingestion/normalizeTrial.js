export function normalizeTrial(study) {
  const protocol = study.protocolSection || {};

  return {
    nctId:
      protocol.identificationModule?.nctId || null,

    title:
      protocol.identificationModule?.briefTitle || null,

    summary:
      protocol.descriptionModule?.briefSummary || null,

    conditions:
      protocol.conditionsModule?.conditions || [],

    phase:
      (protocol.designModule?.phases || []).join(", ") || null,

    status:
      protocol.statusModule?.overallStatus || null,

    studyType:
      protocol.designModule?.studyType || null,

    eligibility: {
      criteria:
        protocol.eligibilityModule?.eligibilityCriteria || null,
      gender:
        protocol.eligibilityModule?.sex || null,
      minimumAge:
        protocol.eligibilityModule?.minimumAge || null,
      maximumAge:
        protocol.eligibilityModule?.maximumAge || null,
    },

    interventions:
      protocol.armsInterventionsModule?.interventions || [],

    locations:
      protocol.contactsLocationsModule?.locations || [],

    lastUpdated:
      protocol.statusModule?.lastUpdateSubmitDate || null,

    rawJson: study,
  };
}