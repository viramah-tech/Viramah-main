"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// ─── Amenity Data ───────────────────────────────────────────
interface AmenityItem {
  id: string;
  title: string;
  icon: string;
  alt: string;
  measurement: string;
}

const AMENITY_ITEMS: AmenityItem[] = [
  {
    id: "wifi",
    title: "High Speed WiFi",
    icon: "/amenities/wifi.png",
    alt: "High Speed WiFi — Fast connectivity for all your needs",
    measurement: "SPEED: 100 MBPS",
  },
  {
    id: "power",
    title: "Power Backup",
    icon: "/amenities/power backup.png",
    alt: "Power Backup — 24x7 uninterrupted power supply",
    measurement: "UPTIME: 99.9%",
  },
  {
    id: "library",
    title: "Library",
    icon: "/amenities/library.png",
    alt: "Library — Quiet space for focused work and study",
    measurement: "VOL: 500+ BOOKS",
  },
  {
    id: "gym",
    title: "Gym",
    icon: "/amenities/gym.png",
    alt: "Gym — Fitness facilities for your wellness",
    measurement: "AREA: 1,200 SQ FT",
  },
  {
    id: "common",
    title: "Common Areas",
    icon: "/amenities/common area.png",
    alt: "Common Areas — Spacious areas for relaxation",
    measurement: "CAP: 50+ SEATS",
  },
  {
    id: "frontdesk",
    title: "Front Desk",
    icon: "/amenities/front desk.png",
    alt: "Front Desk — 24x7 assistance and support",
    measurement: "AVAIL: 24/7",
  },
  {
    id: "lockers",
    title: "Secure Lockers",
    icon: "/amenities/secure locker.png",
    alt: "Secure Lockers — Safe storage for your belongings",
    measurement: "GRADE: A+ SEC",
  },
  {
    id: "coworking",
    title: "Co-Working Space",
    icon: "/amenities/coworking space.png",
    alt: "Co-working Space — Professional workstations",
    measurement: "DESKS: 30+",
  },
  {
    id: "water",
    title: "Water Dispensers",
    icon: "/amenities/water dispensers.png",
    alt: "Water Dispensers — Clean drinking water 24x7",
    measurement: "TEMP: HOT / COLD",
  },
  {
    id: "cafe",
    title: "Café",
    icon: "/amenities/cafe.png",
    alt: "Café — Convenient dining and refreshments",
    measurement: "MENU: 40+ ITEMS",
  },
  {
    id: "ac",
    title: "AC Units",
    icon: "/amenities/ac.png",
    alt: "AC Units — Climate controlled comfort",
    measurement: "TEMP: 18–26°C",
  },
  {
    id: "gaming",
    title: "Gaming Room",
    icon: "/amenities/gaming room .png",
    alt: "Gaming Room — Entertainment and recreation space",
    measurement: "ZONE: PS5 + PC",
  },
];

// ─── Animation Variants ─────────────────────────────────────
const headerVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
};

const cellVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      delay: i * 0.06,
    },
  }),
};

// ─── Component ──────────────────────────────────────────────
interface AmenitiesSectionProps {
  className?: string;
  id?: string;
}

export function AmenitiesSection({ className, id }: AmenitiesSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);

  // ── Detect hover capability ─────────────────────────────
  useEffect(() => {
    setCanHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }, []);

  // ── Mouse Parallax on Grid (desktop only) ───────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!canHover || !gridRef.current) return;

      const cells = gridRef.current.querySelectorAll<HTMLElement>(".amen-cell");
      const mx = e.clientX;
      const my = e.clientY;
      const xNorm = (mx / window.innerWidth - 0.5) * 20;
      const yNorm = (my / window.innerHeight - 0.5) * 20;

      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);

        if (dist < 400) {
          const power = (400 - dist) / 400;
          cell.style.transform = `translateY(${yNorm * power}px) rotateX(${yNorm * power * -0.5}deg) rotateY(${xNorm * power * 0.5}deg)`;
        } else {
          cell.style.transform = "";
        }
      });
    },
    [canHover]
  );

  const handleMouseLeave = useCallback(() => {
    if (!gridRef.current) return;
    const cells = gridRef.current.querySelectorAll<HTMLElement>(".amen-cell");
    cells.forEach((cell) => {
      cell.style.transform = "";
    });
  }, []);

  return (
    <section
      id={id || "amenities"}
      className={`amen-section ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >


      <div className="amen-container">
        {/* ── Header ─────────────────────────────────── */}
        <motion.header
          className="amen-header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="amen-header-serial">
            Viramah Living — Amenities
          </span>
          <h2 className="amen-header-title">
            What We
            <br />
            Provide
          </h2>
        </motion.header>

        {/* ── Grid ───────────────────────────────────── */}
        <div
          className="amen-grid"
          ref={gridRef}
          role="list"
          aria-label="Amenities offered at Viramah"
        >
          {AMENITY_ITEMS.map((item, i) => (
            <motion.div
              className="amen-cell"
              key={item.id}
              role="listitem"
              tabIndex={0}
              aria-label={item.alt}
              variants={cellVariants}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Corner brackets */}
              <div className="amen-corner tl" aria-hidden="true" />
              <div className="amen-corner tr" aria-hidden="true" />
              <div className="amen-corner bl" aria-hidden="true" />
              <div className="amen-corner br" aria-hidden="true" />

              {/* Icon */}
              <div className="amen-icon-wrap">
                <Image
                  src={item.icon}
                  alt=""
                  width={200}
                  height={200}
                  className="amen-icon-img"
                  loading="lazy"
                />
              </div>

              {/* Data overlay */}
              <div className="amen-data">
                <div className="amen-label">{item.title}</div>
                <div className="amen-measurement">
                  {item.measurement}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
