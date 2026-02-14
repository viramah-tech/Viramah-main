// types/amenities.ts
export interface Amenity {
  id: string;
  title: string;
  icon: string; // path to image
  alt: string;
  category?: 'connectivity' | 'comfort' | 'security' | 'community';
}

export const AMENITIES: Amenity[] = [
  { id: 'wifi', title: 'HIGH SPEED WIFI', icon: '/amenities/wifi.png', alt: 'High Speed WiFi - Fast connectivity for all your needs', category: 'connectivity' },
  { id: 'power', title: 'POWER BACKUP', icon: '/amenities/power%20backup.png', alt: 'Power Backup - 24x7 uninterrupted power supply', category: 'connectivity' },
  { id: 'library', title: 'LIBRARY', icon: '/amenities/library.png', alt: 'Library - Quiet space for focused work and study', category: 'comfort' },
  { id: 'gym', title: 'GYM', icon: '/amenities/gym.png', alt: 'Gym - Fitness facilities for your wellness', category: 'comfort' },
  { id: 'common', title: 'COMMON AREAS', icon: '/amenities/common%20area.png', alt: 'Common Areas - Spacious areas for relaxation and socializing', category: 'community' },
  { id: 'frontdesk', title: 'FRONT DESK', icon: '/amenities/front%20desk.png', alt: 'Front Desk - 24x7 assistance and support', category: 'security' },
  { id: 'lockers', title: 'SECURE LOCKERS', icon: '/amenities/secure%20locker.png', alt: 'Secure Lockers - Safe storage for your belongings', category: 'security' },
  { id: 'coworking', title: 'CO-WORKING SPACE', icon: '/amenities/coworking%20space.png', alt: 'Co-working Space - Professional workstations and collaboration areas', category: 'community' },
  { id: 'water', title: 'WATER DISPENSERS', icon: '/amenities/water%20dispensers.png', alt: 'Water Dispensers - Clean drinking water available 24x7', category: 'comfort' },
  { id: 'cafe', title: 'CAFE', icon: '/amenities/cafe.png', alt: 'Cafe - Convenient dining and refreshments', category: 'community' },
  { id: 'ac', title: 'AC UNITS', icon: '/amenities/ac.png', alt: 'AC Units - Climate controlled comfort in every room', category: 'comfort' },
  { id: 'gaming', title: 'GAMING ROOM', icon: '/amenities/gaming%20room%20.png', alt: 'Gaming Room - Entertainment and recreation space for gaming and fun', category: 'community' },
];
