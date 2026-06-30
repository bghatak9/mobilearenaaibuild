import type { Prisma } from '@prisma/client';

import { slugify } from '../common/slug';
import {
  deviceBrandFromRow,
  deviceCategoryFromRow,
  deviceManufacturerFromRow,
  deviceNameFromRow,
  resolveDeviceImportRow,
} from './import-device-fields';

type Tx = Prisma.TransactionClient;

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

function parseNumber(text: string): number | null {
  if (!text) return null;
  const match = text.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function parseYesNo(text: string): boolean | null {
  if (!text) return null;
  const normalized = text.trim().toLowerCase();
  if (['yes', 'true', '1', 'y'].includes(normalized)) return true;
  if (['no', 'false', '0', 'n'].includes(normalized)) return false;
  return null;
}

function parseChargingFlag(text: string): boolean {
  const yesNo = parseYesNo(text);
  if (yesNo != null) return yesNo;
  return Boolean(text.trim());
}

function parseMegapixels(text: string): number | null {
  const value = parseNumber(text);
  if (value == null) return null;
  return Math.round(value);
}

export function deviceSlugFromRow(row: Record<string, unknown>): string {
  const resolved = resolveDeviceImportRow(row);
  const explicit = strFrom(resolved, 'slug', 'device_slug');
  if (explicit) return slugify(explicit);
  return slugify(deviceNameFromRow(resolved));
}

export function deviceAnnouncedDateFromRow(
  row: Record<string, unknown>,
): Date | null | 'invalid' {
  for (const key of ['announced_date', 'announce_date', 'announced']) {
    const raw = str(row, key);
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'invalid';
    return date;
  }
  return null;
}

export function deviceReleasedDateFromRow(
  row: Record<string, unknown>,
): Date | null | 'invalid' {
  for (const key of ['released_date', 'release_date', 'released', 'launch_date']) {
    const raw = str(row, key);
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'invalid';
    return date;
  }
  return null;
}

export function buildDeviceScalarData(row: Record<string, unknown>) {
  const resolved = resolveDeviceImportRow(row);
  const technology = str(resolved, 'technology');
  const ipRating = str(resolved, 'ip_rating');
  const nfc = parseYesNo(str(resolved, 'nfc'));
  const infrared = parseYesNo(str(resolved, 'infrared'));
  const fiveG =
    parseYesNo(str(resolved, 'five_g')) ??
    (technology.toLowerCase().includes('5g') ? true : null);

  return {
    name: deviceNameFromRow(resolved),
    slug: deviceSlugFromRow(resolved),
    brandName: deviceBrandFromRow(resolved),
    categoryName: deviceCategoryFromRow(resolved),
    manufacturerName: deviceManufacturerFromRow(resolved),
    price: parseNumber(str(resolved, 'price')),
    os: str(resolved, 'os') || null,
    weight: parseNumber(str(resolved, 'weight')),
    dimensions: str(resolved, 'dimensions') || null,
    announcedDate: deviceAnnouncedDateFromRow(resolved),
    releasedDate: deviceReleasedDateFromRow(resolved),
    ramGb: parseNumber(str(resolved, 'ram')),
    storageGb: parseNumber(str(resolved, 'storage')),
    nfc: nfc ?? undefined,
    infrared: infrared ?? undefined,
    fiveG: fiveG ?? undefined,
    fingerprint: str(resolved, 'fingerprint') || null,
    waterproof:
      ipRating.toLowerCase().includes('ip') ? true : undefined,
  };
}

function cameraTypesForIndex(index: number): string {
  return ['Main', 'Ultrawide', 'Telephoto', 'Macro', 'Depth'][index] ?? 'Main';
}

function parseCameraRows(row: Record<string, unknown>) {
  const cameras: {
    type: string;
    megapixel: number;
    aperture?: string;
    stabilization: boolean;
  }[] = [];

  const rear = str(row, 'rear_camera');
  if (rear) {
    rear
      .split('+')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part, index) => {
        const megapixel = parseMegapixels(part);
        if (megapixel == null) return;
        cameras.push({
          type: cameraTypesForIndex(index),
          megapixel,
          stabilization: index === 0,
        });
      });
  }

  const front = str(row, 'front_camera');
  const frontMp = parseMegapixels(front);
  if (frontMp != null) {
    cameras.push({
      type: 'Front',
      megapixel: frontMp,
      stabilization: false,
    });
  }

  return cameras;
}

function collectAffiliateLinks(row: Record<string, unknown>): string[] {
  const links: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    if (!key.includes('affiliate')) continue;
    const url = str(row, key);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.push(url);
    }
  }
  return links;
}

export async function applyImportedDeviceRelations(
  tx: Tx,
  deviceId: number,
  row: Record<string, unknown>,
) {
  const resolved = resolveDeviceImportRow(row);

  const displayType = str(resolved, 'display_type');
  const displaySize = parseNumber(str(resolved, 'display_size'));
  if (displayType && displaySize != null) {
    const displayData = {
      type: displayType,
      size: displaySize,
      resolution: str(resolved, 'resolution') || '—',
      refreshRate: parseNumber(str(resolved, 'refresh_rate')) ?? 60,
      brightness: parseNumber(str(resolved, 'brightness_peak')) ?? 0,
      protection: str(resolved, 'protection') || null,
    };
    await tx.display.upsert({
      where: { deviceId },
      create: { ...displayData, deviceId },
      update: displayData,
    });
  }

  const batteryCapacity = parseNumber(str(resolved, 'battery_capacity'));
  if (batteryCapacity != null) {
    const batteryData = {
      capacity: Math.round(batteryCapacity),
      charging: str(resolved, 'wired_charging') || str(resolved, 'charging') || '—',
      wireless: parseChargingFlag(str(resolved, 'wireless_charging')),
      reverse: parseChargingFlag(str(resolved, 'reverse_charging')),
    };
    await tx.battery.upsert({
      where: { deviceId },
      create: { ...batteryData, deviceId },
      update: batteryData,
    });
  }

  const cpu = str(resolved, 'cpu') || str(resolved, 'chipset');
  if (cpu) {
    const chipsetData = {
      cpu,
      gpu: str(resolved, 'gpu') || '—',
      fabrication: str(resolved, 'fabrication') || '—',
      benchmark: parseNumber(str(resolved, 'benchmark')),
    };
    await tx.chipset.upsert({
      where: { deviceId },
      create: { ...chipsetData, deviceId },
      update: chipsetData,
    });
  }

  const cameras = parseCameraRows(resolved);
  if (cameras.length > 0) {
    await tx.camera.deleteMany({ where: { deviceId } });
    await tx.camera.createMany({
      data: cameras.map((camera) => ({ ...camera, deviceId })),
    });
  }

  const imageUrl = strFrom(resolved, 'image_url', 'image', 'photo_url');
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    const existing = await tx.deviceImage.findFirst({
      where: { deviceId, url: imageUrl },
    });
    if (!existing) {
      await tx.deviceImage.create({
        data: {
          deviceId,
          url: imageUrl,
          type: 'gallery',
        },
      });
    }
  }

  const affiliateLinks = collectAffiliateLinks(resolved);
  if (affiliateLinks.length > 0) {
    const offerCount = await tx.deviceAffiliateOffer.count({ where: { deviceId } });
    if (offerCount === 0) {
      await tx.deviceAffiliateOffer.createMany({
        data: affiliateLinks.map((url, index) => ({
          deviceId,
          partner: `Partner ${index + 1}`,
          affiliateUrl: url,
          price: parseNumber(str(resolved, 'price')) ?? 0,
          currency: 'USD',
        })),
      });
    }
  }
}
