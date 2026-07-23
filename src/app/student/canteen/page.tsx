"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Calendar, Check, ZoomIn, Lock, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function StudentMessPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pollData, setPollData] = useState<any>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<{ isOpen: boolean; src: string | null; title: string }>({
    isOpen: false,
    src: null,
    title: "",
  });

  const loadStudentPoll = async () => {
    setLoading(true);
    try {
      const userId = user?.basicInfo?.userId || user?._id || "RESIDENTIAL_STUDENT";
      const res = await fetch(`http://localhost:5000/api/mess/poll/active?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setPollData(data.data);
        setMyVote(data.data?.myVotedOptionId || null);
      }
    } catch (err) {
      console.error("Failed to fetch mess poll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentPoll();
  }, [user]);

  const handleVote = async (optionId: string) => {
    if (!pollData?.poll?._id) return;
    try {
      const userId = user?.basicInfo?.userId || user?._id || "RESIDENTIAL_STUDENT";
      const studentName = user?.basicInfo?.fullName || "Hostel Resident";

      const res = await fetch("http://localhost:5000/api/mess/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: pollData.poll._id,
          userId,
          studentName,
          roomNumber: "101",
          optionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMyVote(optionId);
        loadStudentPoll();
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const poll = pollData?.poll;
  const pollOptions = pollData?.optionsWithTally || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-ivory p-6 rounded-3xl border border-gold/30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-terracotta-raw/10 text-terracotta-raw flex items-center justify-center shrink-0 border border-terracotta-raw/20">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-charcoal">
                Monthly Mess Menu Voting
              </h1>
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                Blind Polling System
              </span>
            </div>
            <p className="text-xs text-charcoal/70 mt-1">
              Review the Weekly Calendar Menu Images uploaded for each plan and tap to select your choice.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-charcoal/5 text-xs font-mono font-semibold text-charcoal/70 flex items-center gap-1.5 border border-charcoal/10">
          <Lock size={13} className="text-emerald-600" /> Votes Private & Hidden
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-charcoal/50">Loading Mess Poll...</div>
      ) : (
        /* WhatsApp-Style Blind Poll Container */
        <div className="bg-[#075E54] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-600/40 space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#25D366] text-[#075E54] text-[10px] font-mono font-bold uppercase">
                Hostel WhatsApp Poll
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                {poll?.title || "Monthly Mess Menu Selection Poll"}
              </h2>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/10 text-emerald-200 border border-white/15">
              {poll?.month}
            </span>
          </div>

          {/* Poll Options Grid */}
          <div className="space-y-4">
            {pollOptions.map((opt: any) => {
              const isSelected = myVote === opt.optionId;
              const isWinner = poll?.winningOptionId === opt.optionId;

              return (
                <div
                  key={opt.optionId}
                  onClick={() => poll?.status === "active" && handleVote(opt.optionId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 overflow-hidden ${
                    isWinner
                      ? "bg-emerald-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg"
                      : isSelected
                      ? "bg-emerald-900/90 border-[#25D366] shadow-md ring-2 ring-[#25D366]/40"
                      : "bg-white/10 border-white/15 hover:bg-white/15"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Radio Circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-[#25D366] border-[#25D366] text-[#075E54]"
                            : "border-white/40 text-transparent"
                        }`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </div>

                      {/* Weekly Calendar Menu Image Thumbnail */}
                      {opt.image && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomImage({ isOpen: true, src: opt.image, title: `${opt.title} — Weekly Mess Menu Calendar` });
                          }}
                          className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/30 relative group shadow-sm bg-black/40"
                        >
                          <img src={opt.image} alt={opt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono">
                            <ZoomIn size={14} />
                            <span>Zoom Menu</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-display">{opt.title}</h3>
                          {isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#25D366] text-[#075E54] text-[10px] font-bold">
                              ✓ Your Choice
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-xs text-white/80 mt-1 max-w-xl">{opt.description}</p>
                        )}

                        {/* Dish Highlights */}
                        {opt.highlights && opt.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {opt.highlights.map((h: string, hIdx: number) => (
                              <span
                                key={hIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/15 text-emerald-100 border border-white/10"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vote Action Button */}
                    <div className="shrink-0 sm:self-center">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#25D366] text-[#075E54] font-bold shadow-sm"
                            : "bg-white/20 text-white hover:bg-[#25D366] hover:text-[#075E54]"
                        }`}
                      >
                        {isSelected ? "✓ Voted" : "Tap to Vote"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage.isOpen && (
        <div
          onClick={() => setZoomImage({ isOpen: false, src: null, title: "" })}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        >
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl relative bg-black">
            <img src={zoomImage.src!} alt={zoomImage.title} className="w-full h-full object-contain" />
          </div>
          <p className="text-white/80 font-mono text-xs mt-3">{zoomImage.title} — Click anywhere to close</p>
        </div>
      )}
    </div>
  );
}
