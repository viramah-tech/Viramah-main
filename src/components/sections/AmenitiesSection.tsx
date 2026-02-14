import { AMENITIES } from "@/types/amenities";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import clsx from "clsx";

interface AmenitiesSectionProps {
  className?: string;
  id?: string;
}

export function AmenitiesSection({ className, id }: AmenitiesSectionProps) {
  return (
    <section
      id={id || "amenities"}
      className={clsx(
        "py-24 bg-sand-light",
        className
      )}
    >
      <Container>
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-terracotta font-serif mb-4 underline decoration-2 decoration-terracotta inline-block">
            Amenities
          </h2>
          <p className="text-lg text-charcoal/70 font-sans">
            We have got all you need for your upcoming stay at one place
          </p>
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 w-full">
            {AMENITIES.map((amenity) => (
              <div key={amenity.id}>
                <div className="relative w-full aspect-square group drop-shadow-lg">
                  <Image
                    src={amenity.icon}
                    alt={amenity.alt}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 16vw"
                    loading="lazy"
                    quality={95}
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
