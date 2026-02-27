"use client";

import { Container } from "@/components/layout/Container";
import Image from "next/image";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";
import "@/styles/food-section.css";

export function FoodSection() {
    return (
        <section className="food-section">
            <Container>
                <div className="food-grid">
                    <div className="food-visual">
                        <div className="food-image-wrap">
                            <Image
                                src="/food section/food img.jpg"
                                alt="Delicious home-style food at Viramah"
                                fill
                                className="food-img"
                            />
                            <div className="food-badge">
                                <span>TASTE OF HOME</span>
                            </div>
                        </div>
                    </div>

                    <div className="food-content">
                        <span className="food-eyebrow">Beyond the Plate</span>
                        <h2 className="food-title">
                            In House Mess
                        </h2>
                        <p className="food-subtitle">
                            Don't come expecting{" "}
                            <span className="food-highlight">"hostel-PG food"</span>
                        </p>
                        <div className="food-body">
                            <p>
                                Instead, bring along a big appetite for healthy, yummy meals.
                                With flavours that have a local touch — and that take your taste buds
                                on a journey back home.
                            </p>
                            <ul className="food-features">
                                <li>24x7 Canteen</li>
                                <li>Self Pantry Services</li>
                                <li>Restaurant</li>
                            </ul>
                            <p className="food-tagline">
                                The mess menu is selected by <em>you</em>, for <em>you</em>.
                            </p>
                        </div>
                        <div className="food-ctas">
                            <EnquireNowButton variant="gold" label="Enquire Now" />
                            <EnquireNowButton variant="outline" label="Schedule a Visit" />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
