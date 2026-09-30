"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const items = [
  {
    title: "Luxury Burial Styling",
    category: "PORTFOLIO",
    image: "/gpic1.jpg",
  },
  {
    title: "Elegant Entrance Styling",
    category: "PORTFOLIO",
    image: "/gpic2.jpg",
  },
  {
    title: "Floral Table Setup",
    category: "PORTFOLIO",
    image: "/gal1.jpg",
  },
  {
    title: "Luxury Outdoor Event",
    category: "PORTFOLIO",
    image: "/show4.jpg",
  },
  {
    title: "Premium Event Décor",
    category: "PORTFOLIO",
    image: "/show5.jpg",
  },
];

export default function PortfolioGallery() {
  const [active, setActive] = useState(0);
 const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setActive(0);
    }
  }, [isMobile]);

  if (isMobile === null) {
    return null;
  }

  return (
    <section className="bg-[#f7f3ef] py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mb-16">
          <p className="uppercase tracking-[4px] text-sm text-[#572649] mb-4">
            Portfolio
          </p>

          <h2 className="font-serif text-5xl md:text-7xl leading-tight">
            Our Featured Works
          </h2>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {items.map((item, index) => {
            const isActive = active === index;

            return (
              <div
                key={index}
                onMouseEnter={() => {
                  if (!isMobile) {
                    setActive(index);
                  }
                }}
                className={`
                  group cursor-pointer
                  w-full
                  ${isMobile
                    ? "w-full"
                    : isActive
                      ? "lg:w-[420px]"
                      : "lg:w-[170px]"
                  }
                `}
              >
                {/* Image */}
                <div
                  className={`
                    relative overflow-hidden
                    ${isMobile
                      ? isActive
                        ? "h-[420px]"
                        : "h-[300px]"
                      : isActive
                        ? "h-[320px]"
                        : "h-[520px]"
                    }
                  `}
                >
                  {/* Mobile expand/collapse button */}
                  {isMobile && (
                    <div className="absolute top-4 right-4 z-20 lg:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          setActive((prev) =>
                            prev === index ? -1 : index
                          );
                        }}
                        className="rounded-full bg-white/90 p-2 shadow-md"
                      >
                        {isActive ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mobile title */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-5 lg:hidden">
                    <h3 className="text-white text-xl font-serif">
                      {item.title}
                    </h3>
                  </div>

                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={`
                      object-cover
                      ${isActive && !isMobile
                        ? "scale-105"
                        : "scale-100"
                      }
                    `}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                </div>

                {/* Content */}
                {isActive && (
                  <div className="overflow-hidden">
                    <div className="mt-6">
                      <p className="uppercase tracking-[4px] text-xs text-[#b38a55] mb-4">
                        {item.category}
                      </p>

                      <h3 className="font-serif text-3xl text-[#1f1717] leading-tight">
                        {item.title}
                      </h3>

                      <Link href="/gallery">
                        <button className="mt-7 flex items-center gap-2 text-[#1f1717] group/btn cursor-pointer">
                          Explore

                          <ArrowUpRight
                            size={18}
                          />
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}