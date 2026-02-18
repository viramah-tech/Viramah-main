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
                                src="/amenities/cafe.png"
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
                            Don't come expecting <br />
                            <span className="food-highlight">"hostel-PG food"</span>
                        </h2>
                        <div className="food-body">
                            <p>
                                Instead, bring along a big appetite for healthy, yummy meals.
                                With flavours that have a local touch. And that, at the same time, take
                                your taste buds on a journey back home.
                            </p>
                            <p>
                                We believe that what you eat fuels how you think. No repetitive menus,
                                no oily compromises. Just balanced, nutritious dining that makes you
                                look forward to every meal.
                            </p>
                        </div>
                        <div className="food-ctas">
                            <EnquireNowButton variant="gold" label="See Full Menu" />
                            <EnquireNowButton variant="outline" label="Schedule a Visit" />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
