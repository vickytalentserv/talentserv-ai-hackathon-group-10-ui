import type { UploadTemplate } from '@/api/client'

export const PROPERTY_UPLOAD_TEMPLATE: UploadTemplate = {
  dataset_type: 'properties',
  table: 'properties',
  columns: [
    'external_id',
    'source',
    'source_url',
    'title',
    'description',
    'address',
    'city',
    'state',
    'zip_code',
    'price',
    'bedrooms',
    'bathrooms',
    'square_feet',
    'property_type',
    'listing_status',
    'latitude',
    'longitude',
  ],
  notes: [
    'Prices must be in INR (full rupees for sale, monthly rupees for rent).',
    'property_type: apartment, house, villa, flat, condo, townhome',
    'listing_status: for_sale or for_rent',
    'Rows upsert on (source, external_id).',
  ],
}

export const UPLOAD_TEMPLATES: Record<string, UploadTemplate> = {
  properties: PROPERTY_UPLOAD_TEMPLATE,
}

export function getUploadTemplateFallback(datasetType: string): UploadTemplate | null {
  return UPLOAD_TEMPLATES[datasetType] ?? null
}
