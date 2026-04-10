/* ─────────────────────────────────────────
   CARIOCA — Static data & content
   Replace with API calls once the backend is ready.
───────────────────────────────────────── */

export const NAV_LINKS = [
  { label: 'Catálogo',        href: '#catalogo'     },
  { label: 'Colecciones',     href: '/colecciones'  },
  { label: 'Sobre Nosotros',  href: '#nosotros'     },
  { label: 'Blog',            href: '#blog'         },
  { label: 'Contacto',        href: '#contacto'     },
];

export const SOCIAL_LINKS = [
  { label: 'WhatsApp',  href: 'https://wa.me/50688888888', type: 'whatsapp'  },
  { label: 'Instagram', href: 'https://instagram.com/cariocacr', type: 'instagram' },
  { label: 'Linktree',  href: 'https://linktr.ee/cariocacr', type: 'linktree'  },
];

export const FOOTER_NAV = [
  { label: 'Productos',     href: '/catalogo'      },
  { label: 'Colecciones',   href: '/colecciones'   },
  { label: 'Sobre Nosotros', href: '/#nosotros'    },
  { label: 'Blog',           href: '/blog'         },
  { label: 'Contáctanos',    href: '/#contacto'    },
];

export const PRODUCTS = [
  {
    id: 1,
    name:  'Sports Bra Canela',
    price: '₡18.500',
    tag:   'Nuevo',
    slug:  'sports-bra-canela',
  },
  {
    id: 2,
    name:  'Legging Obsidiana',
    price: '₡24.900',
    tag:   'Top',
    slug:  'legging-obsidiana',
  },
  {
    id: 3,
    name:  'Top Flow Coral',
    price: '₡16.200',
    tag:   null,
    slug:  'top-flow-coral',
  },
  {
    id: 4,
    name:  'Short Activo Negro',
    price: '₡19.800',
    tag:   'Nuevo',
    slug:  'short-activo-negro',
  },
];

export const COLLECTIONS = [
  {
    id:   1,
    name: 'Colección Verano',
    sub:  'Ligereza y color',
    slug: 'verano',
  },
  {
    id:   2,
    name: 'Colección Performance',
    sub:  'Máximo rendimiento',
    slug: 'performance',
  },
  {
    id:   3,
    name: 'Colección Minimal',
    sub:  'Esencia sin exceso',
    slug: 'minimal',
  },
  {
    id:   4,
    name: 'Colección Noche',
    sub:  'Dark mode activo',
    slug: 'noche',
  },
];

export const TESTIMONIALS = [
  {
    id:    1,
    name:  'Andrea M.',
    text:  'La calidad es increíble, llevo tres meses usando la legging Obsidiana y parece nueva. 100% recomendada.',
    stars: 5,
  },
  {
    id:    2,
    name:  'Valeria R.',
    text:  'Por fin ropa deportiva que realmente queda bien. El Sports Bra Canela es perfecto para mis entrenamientos.',
    stars: 5,
  },
  {
    id:    3,
    name:  'Sofía P.',
    text:  'Me encantó la atención y la rapidez del envío. El producto superó mis expectativas.',
    stars: 5,
  },
  {
    id:    4,
    name:  'Daniela C.',
    text:  'Diseños únicos que no encontrás en ningún otro lado. Carioca es mi marca favorita.',
    stars: 5,
  },
];

export const CONTACT_INFO = {
  phone:    '8888-8888',
  email:    'hola@carioca.cr',
  location: 'Costa Rica',
};

export const FEATURED_PRODUCT = {
  name:        'Legging Obsidiana',
  description: 'Compresión premium, bolsillo lateral funcional y tejido que no transluce. La favorita de nuestra comunidad.',
  price:       '₡24.900',
  slug:        'legging-obsidiana',
};
