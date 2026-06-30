function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return v == null ? '' : String(v).trim();
}

function strFrom(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key);
    if (value) return value;
  }
  return '';
}

function normalizeKey(key: string): string {
  return key
    .replace(/^\ufeff/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeKey(key);
    if (!normalized) continue;
    out[normalized] = value;
  }
  return out;
}

function expandCommaSeparatedRow(row: Record<string, unknown>): Record<string, unknown> {
  const entries = Object.entries(row).filter(
    ([, value]) => value != null && String(value).trim() !== '',
  );
  if (entries.length !== 1) return row;

  const text = String(entries[0][1]).trim();
  if (!text.includes(',')) return row;

  const parts = text.split(',').map((part) => part.trim());
  if (parts.length < 2) return row;

  return normalizeRow({
    name: parts[0],
    brand: parts[1],
    category: parts[2] || 'Smartphone',
    manufacturer: parts[3],
    price: parts[4],
    os: parts[5],
    weight: parts[6],
    dimensions: parts[7],
  });
}

export function resolveDeviceImportRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  let resolved = expandCommaSeparatedRow(row);

  if (!deviceBrandFromRow(resolved)) {
    const manufacturer = strFrom(
      resolved,
      'manufacturer',
      'manufacturer_name',
      'oem',
    );
    if (manufacturer) {
      resolved = { ...resolved, brand: manufacturer };
    }
  }

  return resolved;
}

export function deviceNameFromRow(row: Record<string, unknown>): string {
  return strFrom(
    row,
    'name',
    'model_name',
    'device_name',
    'device',
    'model',
    'phone',
    'phone_name',
    'product_name',
    'product',
    'title',
  );
}

export function deviceBrandFromRow(row: Record<string, unknown>): string {
  return strFrom(row, 'brand', 'brand_name', 'make', 'company', 'vendor');
}

export function deviceCategoryFromRow(row: Record<string, unknown>): string {
  const explicit = strFrom(
    row,
    'category',
    'category_name',
    'device_category',
    'type',
    'phone_category',
    'segment',
    'device_type',
  );
  if (explicit) return explicit;

  const name = deviceNameFromRow(row);
  const brand = deviceBrandFromRow(row);
  if (name && brand) return 'Smartphone';

  return '';
}

export function deviceManufacturerFromRow(row: Record<string, unknown>): string {
  return (
    strFrom(row, 'manufacturer', 'manufacturer_name', 'oem') ||
    deviceBrandFromRow(row) ||
    'Unknown'
  );
}

export function isBrandOnlyImportRow(row: Record<string, unknown>): boolean {
  return (
    Boolean(str(row, 'name')) &&
    'logo' in row &&
    !deviceBrandFromRow(row) &&
    !strFrom(row, 'category', 'category_name', 'type', 'device_category')
  );
}

export function isPriceOnlyImportRow(row: Record<string, unknown>): boolean {
  return (
    Boolean(strFrom(row, 'device', 'model', 'name')) &&
    Boolean(str(row, 'country') || str(row, 'country_code')) &&
    Boolean(str(row, 'price')) &&
    !deviceBrandFromRow(row)
  );
}

/** True when the row has no non-empty cell values. */
export function isBlankImportRow(row: Record<string, unknown>): boolean {
  return !Object.values(row).some(
    (value) => value != null && String(value).trim() !== '',
  );
}

export function describeImportRowColumns(row: Record<string, unknown>): string {
  return Object.keys(row)
    .filter((key) => str(row, key))
    .join(', ');
}
