export const mockPartsLookupService = { async lookup(query:string){ return [{ name: query, vendor:'Placeholder vendor', status:'Need to Order' }]; } };
