/** Minimal birth-city dataset: IANA timezone + longitude (°E) for true-solar-time.
 *  Expand freely — keep alphabetical per region. Longitude only needs ~0.1° precision. */
export interface City { name: string; tz: string; lon: number }
export const CITIES: City[] = [
  { name: 'Seoul',          tz: 'Asia/Seoul',           lon: 126.98 },
  { name: 'Busan',          tz: 'Asia/Seoul',           lon: 129.08 },
  { name: 'Tokyo',          tz: 'Asia/Tokyo',           lon: 139.69 },
  { name: 'Osaka',          tz: 'Asia/Tokyo',           lon: 135.50 },
  { name: 'Beijing',        tz: 'Asia/Shanghai',        lon: 116.41 },
  { name: 'Shanghai',       tz: 'Asia/Shanghai',        lon: 121.47 },
  { name: 'Taipei',         tz: 'Asia/Taipei',          lon: 121.56 },
  { name: 'Hong Kong',      tz: 'Asia/Hong_Kong',       lon: 114.17 },
  { name: 'Singapore',      tz: 'Asia/Singapore',       lon: 103.85 },
  { name: 'Bangkok',        tz: 'Asia/Bangkok',         lon: 100.50 },
  { name: 'Hanoi',          tz: 'Asia/Ho_Chi_Minh',     lon: 105.85 },
  { name: 'Ho Chi Minh City', tz: 'Asia/Ho_Chi_Minh',   lon: 106.63 },
  { name: 'Jakarta',        tz: 'Asia/Jakarta',         lon: 106.85 },
  { name: 'Manila',         tz: 'Asia/Manila',          lon: 120.98 },
  { name: 'Delhi',          tz: 'Asia/Kolkata',         lon: 77.10 },
  { name: 'Dubai',          tz: 'Asia/Dubai',           lon: 55.27 },
  { name: 'Sydney',         tz: 'Australia/Sydney',     lon: 151.21 },
  { name: 'Melbourne',      tz: 'Australia/Melbourne',  lon: 144.96 },
  { name: 'Auckland',       tz: 'Pacific/Auckland',     lon: 174.76 },
  { name: 'London',         tz: 'Europe/London',        lon: -0.13 },
  { name: 'Paris',          tz: 'Europe/Paris',         lon: 2.35 },
  { name: 'Berlin',         tz: 'Europe/Berlin',        lon: 13.40 },
  { name: 'Madrid',         tz: 'Europe/Madrid',        lon: -3.70 },
  { name: 'Rome',           tz: 'Europe/Rome',          lon: 12.50 },
  { name: 'Moscow',         tz: 'Europe/Moscow',        lon: 37.62 },
  { name: 'Istanbul',       tz: 'Europe/Istanbul',      lon: 28.98 },
  { name: 'New York',       tz: 'America/New_York',     lon: -74.01 },
  { name: 'Toronto',        tz: 'America/Toronto',      lon: -79.38 },
  { name: 'Chicago',        tz: 'America/Chicago',      lon: -87.63 },
  { name: 'Denver',         tz: 'America/Denver',       lon: -104.99 },
  { name: 'Los Angeles',    tz: 'America/Los_Angeles',  lon: -118.24 },
  { name: 'Vancouver',      tz: 'America/Vancouver',    lon: -123.12 },
  { name: 'Mexico City',    tz: 'America/Mexico_City',  lon: -99.13 },
  { name: 'São Paulo',      tz: 'America/Sao_Paulo',    lon: -46.63 },
  { name: 'Buenos Aires',   tz: 'America/Argentina/Buenos_Aires', lon: -58.38 },
];

/** UTC offset (minutes east) of `timeZone` for a given LOCAL wall-clock time.
 *  Two-pass so DST transitions resolve against the local time, not a UTC guess. */
export function tzOffsetMinutes(timeZone: string, y: number, mo: number, d: number, h = 12, mi = 0): number {
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (utcMs: number): number => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(new Date(utcMs));
    const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'));
    return (asUtc - utcMs) / 60000;
  };
  const first = offsetAt(wall);            // pretend wall time is UTC
  return offsetAt(wall - first * 60000);   // refine against the real instant
}
