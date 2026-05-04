export interface Parish {
  uid: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  name: string;
  city: string;
  detail_url?: string;
  url?: string;
  full_title?: string;
  founded?: string | null;
  organization?: string;
  physical_address?: {
    full: string;
    lines: string[];
  };
  mailing_address?: {
    full: string;
    lines: string[];
  };
  contact?: {
    phone?: string;
    alternate_phone?: string;
    fax?: string;
    email?: string;
    website?: string;
  };
  clergy?: Array<{
    name: string;
    uid?: string;
    role?: string;
  }>;
  additional_info?: {
    service_languages?: string;
    notes?: string;
  };
  photo_url?: string;
  last_updated?: string;
}
