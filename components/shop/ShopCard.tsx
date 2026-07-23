"use client";

import Link from "next/link";
import Image from "next/image";
import { Shop } from "@/lib/types";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const ScrollIfLong = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const originalWidth = contentRef.current.scrollWidth;
      if (originalWidth > containerWidth) {
        setShouldScroll(true);
        setContentWidth(originalWidth + 24); // original width + 24px gap
      }
    }
  }, [children]);

  return (
    <div ref={containerRef} className="overflow-hidden w-full relative">
      <motion.div
        animate={shouldScroll ? { x: [0, -contentWidth] } : { x: 0 }}
        transition={shouldScroll ? {
          duration: contentWidth / 20, // speed
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        } : {}}
        className={shouldScroll ? "flex w-max" : ""}
        style={{ gap: shouldScroll ? 24 : 0 }}
      >
        <div ref={contentRef} className={className}>
          {children}
        </div>
        {shouldScroll && (
          <div className={className}>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ShopCardProps {
  shop: Shop;
}

const hiddenShopTags = new Set(["halal", "gluten-free", "gluten free"]);

export const ShopCard = ({ shop }: ShopCardProps) => {
  const visibleTags = shop.tags.filter((tag) => !hiddenShopTags.has(tag.toLowerCase()));

  return (
    <article className="group flex-shrink-0 w-full h-[220px] snap-start transition-smooth rounded-3xl">
      <Link
        href={`/shop/${shop.slug}`}
        id={`shop-card-${shop.id}`}
        className="flex flex-col h-full rounded-3xl shadow-soft bg-card overflow-hidden focus-dashed"
      >
        {/* Banner Image Area */}
        <div className="relative h-[90px] w-full flex-shrink-0 bg-secondary overflow-hidden">
          {shop.banner ? (
            <Image
              src={shop.banner}
              alt={shop.name}
              fill
              sizes="260px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-3xl">{shop.emoji}</div>
          )}
          
          {/* Overlay Open/Closed Pill */}
          <span
            className={`absolute top-3 right-3 pill text-[10px] font-semibold px-2 py-0.5 z-10 ${
              shop.isOpen
                ? "bg-success/90 text-success-foreground"
                : "bg-destructive/90 text-destructive-foreground"
            }`}
          >
            {shop.isOpen ? "● OPEN" : "● CLOSED"}
          </span>
        </div>

        {/* Content Area */}
        <div className="p-4 pt-3 flex flex-col justify-between flex-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-base tracking-tight truncate">{shop.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{shop.tagline}</p>
          </div>

          <div className="mt-2 overflow-hidden flex flex-col gap-2">
            {shop.closedNote && (
              <ScrollIfLong className="w-max">
                <p className="text-xs text-muted-foreground italic whitespace-nowrap">
                  {shop.closedNote}
                </p>
              </ScrollIfLong>
            )}

            {visibleTags.length > 0 && (
              <ScrollIfLong className="flex gap-1.5 w-max">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </ScrollIfLong>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};
