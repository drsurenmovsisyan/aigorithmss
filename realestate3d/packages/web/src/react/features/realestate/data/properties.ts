export interface RealEstateProperty {
  id: string;
  title: string;
  tagline: string;
  city: string;
  country: string;
  flag: string;
  price: number;
  priceFormatted: string;
  specs: {
    beds: number;
    baths: number;
    sqft: number;
    sqm: number;
    propertyType: string;
    yearBuilt: number;
  };
  location: {
    address: string;
    longitude: number;
    latitude: number;
    altitude: number; // Building height in meters
  };
  cameraTour: {
    approachAltitude: number;
    orbitRadius: number;
    orbitHeight: number; // Target camera orbit altitude
    orbitPitch: number; // In degrees
    balconyHeading: number;
    balconyPitch: number;
  };
  amenities: string[];
  description: string;
  heroImage: string;
  videoTourUrl: string; // Embeddable 4K architectural tour
  matterportUrl?: string; // Interactive 3D twin tour
}

export const LUXURY_PROPERTIES: RealEstateProperty[] = [
  {
    id: 'monaco-tour-odeon',
    title: 'Tour Odéon Sky Penthouse',
    tagline: 'World\'s most prestigious five-story sky penthouse with private water slide',
    city: 'Monte Carlo',
    country: 'Monaco',
    flag: '🇲🇨',
    price: 355000000,
    priceFormatted: '€355,000,000',
    specs: {
      beds: 6,
      baths: 7,
      sqft: 35500,
      sqm: 3300,
      propertyType: 'Sky Penthouse',
      yearBuilt: 2015,
    },
    location: {
      address: '36 Boulevard du Télescope, 98000 Monaco',
      longitude: 7.4326,
      latitude: 43.7486,
      altitude: 170,
    },
    cameraTour: {
      approachAltitude: 450,
      orbitRadius: 180,
      orbitHeight: 210,
      orbitPitch: -18,
      balconyHeading: 160,
      balconyPitch: -8,
    },
    amenities: [
      '360° Mediterranean Sea Views',
      'Private Rooftop Infinity Pool',
      'Circular Water Slide to Terrace',
      'Private Chauffeur & Helipad Access',
      'Full-Floor Wellness Spa & Cinema',
      '24/7 Concierge & Security Suite'
    ],
    description: 'Perched high above the Mediterranean principality of Monaco, the Tour Odéon Penthouse represents the pinnacle of global ultra-luxury living. Spanning five palatial floors, it features floor-to-ceiling glass curved around the coastline, a private rooftop dance floor, and an outdoor infinity pool.',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'dubai-palm-jumeirah',
    title: 'The Palm Royale Beachfront Villa',
    tagline: 'Private white-sand beachfront estate with direct views of the Dubai Marina skyline',
    city: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    price: 48000000,
    priceFormatted: '$48,000,000',
    specs: {
      beds: 7,
      baths: 9,
      sqft: 22000,
      sqm: 2043,
      propertyType: 'Waterfront Villa',
      yearBuilt: 2023,
    },
    location: {
      address: 'Frond G, Palm Jumeirah, Dubai',
      longitude: 55.1232,
      latitude: 25.1278,
      altitude: 15,
    },
    cameraTour: {
      approachAltitude: 350,
      orbitRadius: 130,
      orbitHeight: 45,
      orbitPitch: -18,
      balconyHeading: 180,
      balconyPitch: -6,
    },
    amenities: [
      'Private 120ft White-Sand Beach',
      'Yacht Mooring & Private Deep-Water Jetty',
      'Cascading Overflow Infinity Pool',
      'Italian Calacatta Marble Finishes',
      'Air-Conditioned 8-Car Supercar Gallery',
      'Private Cinema & Sommelier Cigar Lounge'
    ],
    description: 'A bespoke architectural masterpiece on Palm Jumeirah\'s billionaire row, this bespoke villa blends organic travertine stone with seamless indoor-outdoor sliding glass panels, delivering uninterrupted panoramas of the Arabian Gulf and Marina skyline.',
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'nyc-432-park',
    title: 'Billionaires\' Row Tower Penthouse',
    tagline: 'Full-floor residence hovering 1,300 feet above Central Park & Manhattan',
    city: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    price: 79000000,
    priceFormatted: '$79,000,000',
    specs: {
      beds: 5,
      baths: 6,
      sqft: 8255,
      sqm: 767,
      propertyType: 'Super-Tall Penthouse',
      yearBuilt: 2016,
    },
    location: {
      address: '432 Park Avenue, New York, NY 10022',
      longitude: -73.9719,
      latitude: 40.7615,
      altitude: 395,
    },
    cameraTour: {
      approachAltitude: 700,
      orbitRadius: 240,
      orbitHeight: 430,
      orbitPitch: -15,
      balconyHeading: 355,
      balconyPitch: -5,
    },
    amenities: [
      '10ft x 10ft Signature Picture Windows',
      'Unobstructed 360° Central Park Views',
      'Private Key-Locked Elevator Vestibule',
      'Private Michelin-Star Resident Restaurant',
      '75ft Heated Indoor Swimming Pool',
      'Temperature-Controlled Wine Cellar'
    ],
    description: 'Hovering nearly 1,300 feet above the streets of Manhattan, this iconic full-floor sky residence offers an extraordinary vantage point over Central Park, the Hudson and East Rivers, and the entire New York City skyline.',
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'miami-star-island',
    title: 'Star Island Modern Waterfront Estate',
    tagline: 'Gated enclave mansion with deep-water mega-yacht slip and western sunset views',
    city: 'Miami',
    country: 'USA',
    flag: '🇺🇸',
    price: 59000000,
    priceFormatted: '$59,000,000',
    specs: {
      beds: 8,
      baths: 11,
      sqft: 18500,
      sqm: 1718,
      propertyType: 'Bayfront Estate',
      yearBuilt: 2022,
    },
    location: {
      address: 'Star Island Drive, Miami Beach, FL 33139',
      longitude: -80.1528,
      latitude: 25.7781,
      altitude: 10,
    },
    cameraTour: {
      approachAltitude: 280,
      orbitRadius: 130,
      orbitHeight: 36,
      orbitPitch: -18,
      balconyHeading: 265,
      balconyPitch: -6,
    },
    amenities: [
      '200ft Prime Deep-Water Frontage',
      'Double Mega-Yacht Dock',
      'Resort-Style Saltwater Lagoon Pool',
      'Rooftop Lounge with Downtown Miami Skyline View',
      'Detached 2-Bedroom Guest Villa',
      '24/7 Armed Guarded Island Access'
    ],
    description: 'Located in Miami\'s most exclusive gated island community, this modern tropical sanctuary combines floor-to-ceiling glass, polished concrete, and lush specimen palms with direct western exposure for legendary Miami sunsets over Biscayne Bay.',
    heroImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'london-mayfair',
    title: 'Grosvenor Square Palatial Mansion',
    tagline: 'Meticulously restored Georgian residence with modern subterranean wellness complex',
    city: 'London',
    country: 'UK',
    flag: '🇬🇧',
    price: 52000000,
    priceFormatted: '£52,000,000',
    specs: {
      beds: 6,
      baths: 8,
      sqft: 14200,
      sqm: 1319,
      propertyType: 'Historic Townhouse',
      yearBuilt: 2021,
    },
    location: {
      address: 'Grosvenor Square, Mayfair, London W1K',
      longitude: -0.1512,
      latitude: 51.5115,
      altitude: 35,
    },
    cameraTour: {
      approachAltitude: 300,
      orbitRadius: 110,
      orbitHeight: 68,
      orbitPitch: -20,
      balconyHeading: 90,
      balconyPitch: -8,
    },
    amenities: [
      'Subterranean 20m Swimming Pool & Spa',
      'Private Mews House & Car Lift',
      'Direct Private Access to Grosvenor Gardens',
      'State-of-the-art Acoustic Screening Room',
      'Grand Double-Height Reception Rooms',
      'Full Staff Quarters & Commercial Prep Kitchen'
    ],
    description: 'A monument to British architectural heritage updated with twenty-first-century ultra-luxury engineering. Situated on one of London\'s most sought-after garden squares, it combines grand proportions with museum-grade finishes.',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'paris-montaigne',
    title: 'Avenue Montaigne Golden Triangle Penthouse',
    tagline: 'Haussmannian triplex penthouse commanding front-row panoramas of the Eiffel Tower & Seine',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    price: 42000000,
    priceFormatted: '€42,000,000',
    specs: {
      beds: 5,
      baths: 6,
      sqft: 8500,
      sqm: 790,
      propertyType: 'Haussmannian Sky Mansion',
      yearBuilt: 2022,
    },
    location: {
      address: 'Avenue Montaigne, 75008 Paris, France',
      longitude: 2.3045,
      latitude: 48.8656,
      altitude: 42,
    },
    cameraTour: {
      approachAltitude: 320,
      orbitRadius: 140,
      orbitHeight: 75,
      orbitPitch: -16,
      balconyHeading: 220,
      balconyPitch: -5,
    },
    amenities: [
      'Unobstructed Eiffel Tower & Seine River Vistas',
      'Heated Rooftop Infinity Jacuzzi & Sun Deck',
      'Chevron Versailles Parquet & Calacatta Oro Fireplaces',
      'Custom Boffi Culinary Suite & Sommelier Cave',
      'Private Chauffeur Mews & Automated Car Lift',
      '24/7 Monitored Concierge & Diplomatic-Grade Security'
    ],
    description: 'Situated on Paris\' most coveted high-fashion boulevard in the Golden Triangle, this multi-level sky mansion offers quintessential Parisian elegance. Wraparound balconies and a private top-deck teak terrace offer eye-level views of the sparkling Eiffel Tower.',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'rome-piazza-di-spagna',
    title: 'Palazzo Trinità Sky Penthouse',
    tagline: 'Aristocratic palazzo residence overlooking Spanish Steps, Villa Borghese & St. Peter\'s Dome',
    city: 'Rome',
    country: 'Italy',
    flag: '🇮🇹',
    price: 26500000,
    priceFormatted: '€26,500,000',
    specs: {
      beds: 5,
      baths: 6,
      sqft: 7200,
      sqm: 669,
      propertyType: 'Historic Palazzo Duplex',
      yearBuilt: 2023,
    },
    location: {
      address: 'Piazza di Spagna, 00187 Roma RM, Italy',
      longitude: 12.4828,
      latitude: 41.9060,
      altitude: 45,
    },
    cameraTour: {
      approachAltitude: 320,
      orbitRadius: 130,
      orbitHeight: 75,
      orbitPitch: -18,
      balconyHeading: 230,
      balconyPitch: -6,
    },
    amenities: [
      'Private Roman Travertine Wrap Terrace',
      'Direct Sightlines to Spanish Steps & St. Peter\'s Dome',
      'Restored 17th-Century Frescoed 18ft Ceilings',
      'Private Biometric Glass Elevator Direct to Foyer',
      'Temperature-Controlled 2,500-Bottle Wine Vault',
      'Subterranean Roman Spa & Plunge Pool'
    ],
    description: 'Commanding an incomparable vantage point above the Spanish Steps and Trinità dei Monti, this palatial duplex merges Baroque architectural heritage with bespoke Italian contemporary craft. Sunset over the eternal city reveals golden reflections across Rome\'s domes and cypress hills.',
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'barcelona-passeig-de-gracia',
    title: 'Passeig de Gràcia Modernist Penthouse',
    tagline: 'Architectural masterpiece with private rooftop pool overlooking Sagrada Família & Mediterranean',
    city: 'Barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    price: 21500000,
    priceFormatted: '€21,500,000',
    specs: {
      beds: 4,
      baths: 5,
      sqft: 6200,
      sqm: 576,
      propertyType: 'Catalan Modernist Duplex',
      yearBuilt: 2023,
    },
    location: {
      address: 'Passeig de Gràcia, 08007 Barcelona, Spain',
      longitude: 2.1649,
      latitude: 41.3917,
      altitude: 48,
    },
    cameraTour: {
      approachAltitude: 300,
      orbitRadius: 130,
      orbitHeight: 80,
      orbitPitch: -18,
      balconyHeading: 70,
      balconyPitch: -6,
    },
    amenities: [
      'Private Teak Rooftop Plunge Pool & Solarium',
      'Direct Panoramas to Sagrada Família Spires & Sea',
      'Restored Catalan Vaulted Ceilings & Hydraulic Tiles',
      'Gaggenau Chef Kitchen with Custom Terrazzo Island',
      'Private High-Speed Direct Foyer Elevator',
      'Smart Climate & Automated Louvered Shading System'
    ],
    description: 'Framed by the grand modernist architecture of Passeig de Gràcia, this duplex penthouse fuses historic Catalan artisanal detail with cutting-edge Nordic minimalism. The rooftop terrace captures the Mediterranean breeze and morning light over Gaudi\'s monuments.',
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'vienna-stephansplatz',
    title: 'Ringstraße Palais Penthouse',
    tagline: 'Imperial duplex penthouse overlooking St. Stephen\'s Cathedral and Vienna skyline',
    city: 'Vienna',
    country: 'Austria',
    flag: '🇦🇹',
    price: 18500000,
    priceFormatted: '€18,500,000',
    specs: {
      beds: 4,
      baths: 5,
      sqft: 6800,
      sqm: 632,
      propertyType: 'Heritage Duplex',
      yearBuilt: 2024,
    },
    location: {
      address: 'Stephansplatz, 1010 Wien, Austria',
      longitude: 16.3725,
      latitude: 48.2082,
      altitude: 75,
    },
    cameraTour: {
      approachAltitude: 380,
      orbitRadius: 130,
      orbitHeight: 110,
      orbitPitch: -18,
      balconyHeading: 45,
      balconyPitch: -6,
    },
    amenities: [
      'Direct Eye-Level View of Stephansdom Spire',
      'Wraparound Teak Rooftop Terrace',
      'Private Glass Elevator Direct to Foyer',
      'Custom Boffi Kitchen with Wine Cellar',
      'Private In-Home Hammam & Sauna',
      'Valet Underground Parking'
    ],
    description: 'An extraordinary union of historic 19th-century Viennese Ringstraße architecture and contemporary glass engineering. The expansive private terrace commands uninterrupted panoramas across the gothic tiled roof of Stephansdom and the Vienna Woods.',
    heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'prague-mala-strana',
    title: 'Malá Strana Castle View Palais',
    tagline: 'Baroque palace residence perched below Prague Castle with Charles Bridge panoramas',
    city: 'Prague',
    country: 'Czech Republic',
    flag: '🇨🇿',
    price: 16800000,
    priceFormatted: '€16,800,000',
    specs: {
      beds: 4,
      baths: 5,
      sqft: 6500,
      sqm: 604,
      propertyType: 'Baroque Palais Penthouse',
      yearBuilt: 2024,
    },
    location: {
      address: 'Thunovská, Malá Strana, 118 00 Praha 1, Czechia',
      longitude: 14.4035,
      latitude: 50.0898,
      altitude: 55,
    },
    cameraTour: {
      approachAltitude: 340,
      orbitRadius: 140,
      orbitHeight: 92,
      orbitPitch: -18,
      balconyHeading: 115,
      balconyPitch: -6,
    },
    amenities: [
      'Unmatched Vistas of Prague Castle & Charles Bridge',
      'Private Terraced Baroque Garden & Sun Pergola',
      'Historic Restored 16th-Century Timber Beamed Ceilings',
      'Private Wellness Suite with Cedar Sauna & Ice Bath',
      'Gothic Vaulted Degustation Wine Cellar',
      'Secure Gated Courtyard with Private Double Garage'
    ],
    description: 'Nestled on the cobblestone aristocratic slopes of Malá Strana directly beneath Prague Castle, this historic palace residence commands cinematic views across the red-tiled roofs, Vltava river bridges, and the city of a hundred spires.',
    heroImage: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'capetown-clifton',
    title: 'Clifton 4th Architectural Cliff Villa',
    tagline: 'Dramatic oceanfront sanctuary suspended over Clifton\'s white sands and the 12 Apostles',
    city: 'Cape Town',
    country: 'South Africa',
    flag: '🇿🇦',
    price: 24000000,
    priceFormatted: '$24,000,000',
    specs: {
      beds: 5,
      baths: 6,
      sqft: 11500,
      sqm: 1068,
      propertyType: 'Cliffside Oceanfront Villa',
      yearBuilt: 2021,
    },
    location: {
      address: 'Victoria Road, Clifton 4th, Cape Town',
      longitude: 18.3756,
      latitude: -33.9392,
      altitude: 50,
    },
    cameraTour: {
      approachAltitude: 380,
      orbitRadius: 140,
      orbitHeight: 75,
      orbitPitch: -20,
      balconyHeading: 270,
      balconyPitch: -6,
    },
    amenities: [
      'Direct Private Funicular Beach Access',
      'Cantilevered Rim-Flow Ocean Pool',
      '180° Atlantic Ocean Sunset Exposure',
      'SAOTA Signature Architectural Concrete & Glass',
      'State-of-the-art Off-Grid Solar & Battery System',
      'Wine Tasting Cellar & Ocean-Facing Gymnasium'
    ],
    description: 'Masterfully engineered into the granite cliffs of Clifton, this iconic residence floats above the Atlantic Ocean. Framed by Table Mountain and the Twelve Apostles, it captures Africa\'s most spectacular ocean sunsets.',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  },
  {
    id: 'crete-heraklion',
    title: 'Villa Thalassa Aegean Cliff Estate',
    tagline: 'Cliffside Aegean sanctuary with private sea access and panoramic Cretan Sea sunset vistas',
    city: 'Heraklion (Crete)',
    country: 'Greece',
    flag: '🇬🇷',
    price: 14500000,
    priceFormatted: '€14,500,000',
    specs: {
      beds: 6,
      baths: 7,
      sqft: 9200,
      sqm: 855,
      propertyType: 'Aegean Waterfront Villa',
      yearBuilt: 2023,
    },
    location: {
      address: 'Paleokastro Coastal Promenade, 71500 Heraklion, Crete, Greece',
      longitude: 25.1352,
      latitude: 35.3430,
      altitude: 28,
    },
    cameraTour: {
      approachAltitude: 320,
      orbitRadius: 135,
      orbitHeight: 62,
      orbitPitch: -18,
      balconyHeading: 350,
      balconyPitch: -6,
    },
    amenities: [
      'Direct Private Aegean Sea & Boat Slip Access',
      'Cascading 3-Tier Overflow Saltwater Infinity Pool',
      'Unobstructed Cretan Sea & Venetian Harbour Panoramas',
      'Hand-Carved Cretan Limestone & Olive Wood Interiors',
      'Private Olive Grove, Herb Garden & Wine Tasting Cave',
      'Helipad & 24/7 Gated Security Suite'
    ],
    description: 'Perched majestically above the crystal-clear waters of the Cretan Sea near Heraklion\'s historic Venetian port, Villa Thalassa embodies the ultimate Mediterranean waterfront retreat. Seamless glass walls open onto expansive white limestone terraces, cascading infinity pools, and direct turquoise sea access.',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&loop=1',
  }
];
