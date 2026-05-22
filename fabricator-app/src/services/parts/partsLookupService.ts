export type VendorSearchLink = {
  name: string;
  url: string;
};

export const partSearchVendors = [
  { name: 'Amazon', url: 'https://www.amazon.com/s?k=' },
  { name: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' },
  { name: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?partnum=' },
  { name: 'JEGS', url: 'https://www.jegs.com/search/?q=' },
  { name: 'Summit Racing', url: 'https://www.summitracing.com/search?keyword=' },
  { name: 'AutoZone', url: 'https://www.autozone.com/searchresult?searchText=' },
  { name: "O'Reilly", url: 'https://www.oreillyauto.com/search?q=' },
  { name: 'Advance Auto', url: 'https://shop.advanceautoparts.com/find?searchTerm=' },
  { name: 'NAPA', url: 'https://www.napaonline.com/en/search?text=' },
];

export function buildVendorSearchLinks(partName: string): VendorSearchLink[] {
  const query = encodeURIComponent(partName.trim());
  return partSearchVendors.map(vendor => ({
    name: vendor.name,
    url: `${vendor.url}${query}`,
  }));
}

export const mockPartsLookupService = {
  async lookup(query: string) {
    return buildVendorSearchLinks(query);
  },
};
