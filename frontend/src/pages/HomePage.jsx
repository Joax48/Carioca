/* ─────────────────────────────────────────
   HomePage — page component
   Assembles all homepage sections in order.
   Each section is independently scrollable
   and handles its own reveal animations.
───────────────────────────────────────── */

import { useState } from 'react';
import { Navbar, Footer }                    from '../components/layout';
import {
  HeroSection,
  IntroSection,
  ProductsSection,
  FeaturedBanner,
  CollectionsSection,
  TestimonialsSection,
} from '../components/sections';

export function HomePage() {
  const [cartCount, setCartCount] = useState(0);

  /**
   * Adds a product to the cart.
   * Replace with real cart state management (Zustand / Context)
   * once the cart feature is built.
   */
  const handleAddToCart = (product) => {
    setCartCount(n => n + 1);
    // TODO: dispatch to cart store, show mini-cart toast
    console.info('[Cart] Added:', product.name);
  };

  return (
    <>
      {/* ── Fixed navigation ── */}
      <Navbar cartCount={cartCount} />

      {/* ── Main content ── */}
      <main>
        {/* 1. Full-viewport hero */}
        <HeroSection />

        {/* 2. Brand philosophy text block */}
        <IntroSection />

        {/* 3. Featured products grid */}
        <ProductsSection onAddToCart={handleAddToCart} />

        {/* 4. Dark promotional banner for a highlighted product */}
        <FeaturedBanner />

        {/* 5. Shop-by-collection 2×2 grid */}
        <CollectionsSection />

        {/* 6. Customer testimonials carousel */}
        <TestimonialsSection />
      </main>

      {/* ── Site footer ── */}
      <Footer />
    </>
  );
}
