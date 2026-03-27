"use client";

import { Check } from "lucide-react";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

type HoldStatus = "pending_approval" | "active" | "converted" | "refunded" | "expired" | "idle";

interface BookingTimelineProps {
  currentStatus?: HoldStatus;
  /** Pass true for compact inline display (e.g. on deposit page) */
  compact?: boolean;
  /** Actual total deposit paid (security + registration + advance) from DB */
  depositTotal?: number;
  /** Advance amount (if any) */
  advanceAmount?: number;
}

interface Step {
  id: number;
  label: string;
  sublabel: string;
  emoji: string;
}

function buildSteps(depositTotal?: number, advanceAmount?: number): Step[] {
  const amt = depositTotal && depositTotal > 0
    ? `₹${Math.round(depositTotal).toLocaleString("en-IN")}`
    : "₹16,000";
  const sub = advanceAmount && advanceAmount > 0
    ? "Security + Registration + Advance"
    : "Security + Registration Fee";
  return [
    { id: 1, label: `Pay ${amt} Deposit`, sublabel: sub, emoji: "💳" },
    { id: 2, label: "Room Held for You", sublabel: "Up to 21 days", emoji: "🔒" },
    { id: 3, label: "Complete Payment", sublabel: "Room Confirmed", emoji: "✅" },
  ];
}

function getActiveStep(status: HoldStatus): number {
  switch (status) {
    case "idle":
    case "pending_approval":
      return 1;
    case "active":
      return 2;
    case "converted":
      return 4; // All done
    case "refunded":
    case "expired":
      return 0; // Cancelled
    default:
      return 1;
  }
}

export default function BookingTimeline({ currentStatus = "idle", compact = false, depositTotal, advanceAmount }: BookingTimelineProps) {
  const activeStep = getActiveStep(currentStatus);
  const isCancelled = currentStatus === "refunded" || currentStatus === "expired";
  const STEPS = buildSteps(depositTotal, advanceAmount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 8 : 0,
        flexWrap: "nowrap",
        width: "100%",
        overflowX: "auto",
        padding: compact ? "8px 0" : "16px 0",
      }}
    >
      {STEPS.map((step, i) => {
        const isCompleted = activeStep > step.id;
        const isActive = activeStep === step.id;
        const isUpcoming = activeStep < step.id;

        return (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              flex: compact ? "0 0 auto" : 1,
              minWidth: 0,
            }}
          >
            {/* Step node */}
            <div
              style={{
                display: "flex",
                flexDirection: compact ? "row" : "column",
                alignItems: "center",
                gap: compact ? 6 : 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: compact ? 32 : 48,
                  height: compact ? 32 : 48,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: compact ? "0.9rem" : "1.2rem",
                  background: isCancelled
                    ? "rgba(220,38,38,0.08)"
                    : isCompleted
                    ? GREEN
                    : isActive
                    ? "rgba(216,181,106,0.15)"
                    : "rgba(31,58,45,0.05)",
                  border: `2px solid ${
                    isCancelled
                      ? "rgba(220,38,38,0.2)"
                      : isCompleted
                      ? GREEN
                      : isActive
                      ? GOLD
                      : "rgba(31,58,45,0.12)"
                  }`,
                  boxShadow: isActive ? `0 0 0 4px rgba(216,181,106,0.15)` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted ? (
                  <Check size={compact ? 12 : 16} color={GOLD} strokeWidth={3} />
                ) : (
                  <span>{step.emoji}</span>
                )}
              </div>

              {/* Labels */}
              {!compact && (
                <div style={{ textAlign: "center", padding: "0 4px" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body, sans-serif)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: isUpcoming ? "rgba(31,58,45,0.35)" : GREEN,
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.58rem",
                      color: "rgba(31,58,45,0.4)",
                      margin: "3px 0 0",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {step.sublabel}
                  </p>
                </div>
              )}

              {compact && (
                <span
                  style={{
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 700 : 400,
                    color: isUpcoming ? "rgba(31,58,45,0.35)" : GREEN,
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector arrow */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: compact ? "0 4px" : "0 8px",
                  flexShrink: 0,
                  marginTop: compact ? 0 : -20, // align with circles (not labels)
                }}
              >
                <div
                  style={{
                    width: compact ? 20 : 32,
                    height: 2,
                    background:
                      activeStep > i + 1
                        ? `linear-gradient(90deg, ${GREEN}, ${GOLD})`
                        : "rgba(31,58,45,0.1)",
                    transition: "background 0.4s ease",
                  }}
                />
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderLeft: `5px solid ${activeStep > i + 1 ? GOLD : "rgba(31,58,45,0.1)"}`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
