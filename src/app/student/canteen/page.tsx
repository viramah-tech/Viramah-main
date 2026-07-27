"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UtensilsCrossed, CheckCircle2, Vote, RefreshCw, Coffee, Sunset, Moon, Sun, ImageIcon, Check, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CanteenPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Top Level View Switcher: 'menu' (Daily Schedule) vs 'vote' (Monthly Menu Poll)
    const [viewMode, setViewMode] = useState<"menu" | "vote">("menu");

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [votingOptionId, setVotingOptionId] = useState<string | null>(null);
    const [voteSuccessMsg, setVoteSuccessMsg] = useState<string | null>(null);

    // 1. Fetch Weekly Menu published by Admin
    const { data: weeklyMenuData, isLoading: loadingWeekly, refetch: refetchWeekly } = useQuery({
        queryKey: ["weekly-mess-menu"],
        queryFn: () => apiGet<any[]>(API.mess.weeklyMenu),
    });

    // 2. Fetch Active Monthly Menu Poll for Next Month created by Admin
    const { data: pollResponse, isLoading: loadingPoll, refetch: refetchPoll } = useQuery({
        queryKey: ["active-monthly-poll", user?.basicInfo?.userId],
        queryFn: () => apiGet<any>(`${API.mess.activePoll}?userId=${user?.basicInfo?.userId || ""}`),
    });

    const activePollObj = pollResponse?.poll;
    const optionsWithTally = pollResponse?.optionsWithTally || [];
    const myVotedOptionId = pollResponse?.myVotedOptionId;
    const totalPollVotes = pollResponse?.totalVotes || 0;

    // Handle Vote on Monthly Poll Option
    const handleCastVote = async (optionId: string) => {
        if (!activePollObj?._id || !user?.basicInfo?.userId) return;

        setVotingOptionId(optionId);
        setVoteSuccessMsg(null);

        try {
            await apiPost<any>(API.mess.voteMonthlyPoll, {
                pollId: activePollObj._id,
                userId: user.basicInfo.userId,
                studentName: user.basicInfo.fullName || "Student",
                roomNumber: user.roomNumber || user.roomDetails?.roomNumber || "",
                optionId,
            });

            await refetchPoll();
            setVoteSuccessMsg("Your vote for next month's menu has been recorded!");
        } catch (err: any) {
            alert(err.message || "Failed to record vote.");
        } finally {
            setVotingOptionId(null);
        }
    };

    const currentDayMenu = (weeklyMenuData || [])[selectedDayIndex] || (weeklyMenuData || [])[0];
    const meals = currentDayMenu?.meals || {};

    const MEAL_CATEGORIES = [
        {
            key: "breakfast",
            name: "Breakfast",
            defaultTime: "08:00 AM – 10:00 AM",
            icon: Sun,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-700",
            dotColor: "bg-amber-500",
        },
        {
            key: "snacks",
            name: "Evening Snacks",
            defaultTime: "05:00 PM – 06:30 PM",
            icon: Sunset,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-700",
            dotColor: "bg-orange-500",
        },
        {
            key: "dinner",
            name: "Dinner",
            defaultTime: "08:00 PM – 10:00 PM",
            icon: Moon,
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-700",
            dotColor: "bg-purple-500",
        },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Mess & Dining Portal"
                    subtitle="Daily 3-meal schedule live-synchronized with the Admin Portal & Next Month Menu Selection Poll"
                    badge="LIVE ADMIN SYNC"
                    action={
                        <button
                            onClick={() => {
                                refetchWeekly();
                                refetchPoll();
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-[#1F3A2D]" /> Refresh Data
                        </button>
                    }
                />

                {/* ── TOP-LEVEL VIEW SWITCHER TABS ── */}
                <div className="flex items-center p-1.5 rounded-2xl bg-white border border-emerald-900/10 shadow-sm max-w-md">
                    <button
                        onClick={() => setViewMode("menu")}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            viewMode === "menu"
                                ? "bg-[#1F3A2D] text-white shadow-sm"
                                : "text-emerald-900/70 hover:text-[#1F3A2D] hover:bg-emerald-50/50"
                        }`}
                    >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Daily 3-Meal Schedule</span>
                    </button>

                    <button
                        onClick={() => setViewMode("vote")}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            viewMode === "vote"
                                ? "bg-[#1F3A2D] text-white shadow-sm"
                                : "text-emerald-900/70 hover:text-[#1F3A2D] hover:bg-emerald-50/50"
                        }`}
                    >
                        <Vote className="w-4 h-4 text-[#D8B56A]" />
                        <span>Monthly Menu Poll</span>
                        {myVotedOptionId && (
                            <span className="w-2 h-2 rounded-full bg-[#D8B56A] border border-white" />
                        )}
                    </button>
                </div>

                {/* ── PAGE VIEW CONTENT ── */}
                {viewMode === "menu" ? (
                    /* VIEW MODE 1: DAILY 3-MEAL SCHEDULE (FETCHED FROM ADMIN) */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h3 className="font-serif text-xl font-bold text-[#1F3A2D] m-0">
                                    Weekly Dining Schedule — {DAYS_OF_WEEK[selectedDayIndex]}
                                </h3>
                                <p className="text-xs text-emerald-900/60 m-0">
                                    Live menu data configured and published by the Mess Incharge on the Admin Portal.
                                </p>
                            </div>
                        </div>

                        {/* Day Selector Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                            {DAYS_OF_WEEK.map((dayName, idx) => {
                                const isSelected = selectedDayIndex === idx;
                                return (
                                    <button
                                        key={dayName}
                                        onClick={() => setSelectedDayIndex(idx)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                            isSelected
                                                ? "bg-[#1F3A2D] text-white shadow-sm"
                                                : "bg-white border border-emerald-900/10 text-emerald-900/70 hover:bg-emerald-50"
                                        }`}
                                    >
                                        {dayName}
                                    </button>
                                );
                            })}
                        </div>

                        {/* 3-Meal Grid Display (Breakfast, Evening Snacks, Dinner) */}
                        {loadingWeekly ? (
                            <LoadingSkeleton count={3} />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {MEAL_CATEGORIES.map((catConfig) => {
                                    const Icon = catConfig.icon;
                                    const mealData = meals[catConfig.key] || {};
                                    const optionsList = mealData.options || [];
                                    const timingStr = (mealData.startTime && mealData.endTime)
                                        ? `${mealData.startTime} – ${mealData.endTime}`
                                        : catConfig.defaultTime;

                                    return (
                                        <div
                                            key={catConfig.key}
                                            className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex flex-col justify-between space-y-4"
                                        >
                                            <div>
                                                <div className={`w-10 h-10 rounded-xl ${catConfig.iconBg} flex items-center justify-center mb-3`}>
                                                    <Icon className={`w-5 h-5 ${catConfig.iconColor}`} />
                                                </div>
                                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase block mb-1">
                                                    {timingStr}
                                                </span>
                                                <h4 className="font-serif text-lg font-bold text-[#1F3A2D] mb-3">
                                                    {catConfig.name}
                                                </h4>

                                                {/* Render Options uploaded by Admin */}
                                                {optionsList.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {optionsList.map((opt: any, optIdx: number) => {
                                                            const title = opt.title || `Option ${String.fromCharCode(65 + optIdx)}`;
                                                            const dishes = opt.dishes || [];
                                                            const description = opt.description || "";

                                                            return (
                                                                <div key={optIdx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-900/5 space-y-1.5">
                                                                    <span className="font-bold text-xs text-[#1F3A2D] block">
                                                                        {title}
                                                                    </span>
                                                                    {description && (
                                                                        <p className="text-[0.7rem] text-emerald-900/60 leading-tight m-0">
                                                                            {description}
                                                                        </p>
                                                                    )}
                                                                    {dishes.length > 0 && (
                                                                        <div className="space-y-1 pt-1">
                                                                            {dishes.map((dish: string, dIdx: number) => (
                                                                                <div key={dIdx} className="flex items-center gap-2 text-xs text-emerald-900/80 font-medium">
                                                                                    <div className={`w-1.5 h-1.5 rounded-full ${catConfig.dotColor}`} />
                                                                                    <span>{dish}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-emerald-900/50 font-mono">
                                                        No items specified by admin.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* VIEW MODE 2: MONTHLY MENU SELECTION POLL (NEXT MONTH) */
                    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-emerald-900/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#1F3A2D]/10 flex items-center justify-center">
                                    <Vote className="w-5 h-5 text-[#1F3A2D]" />
                                </div>
                                <div>
                                    <span className="font-mono text-[0.65rem] font-bold text-[#D8B56A] uppercase tracking-wider block">
                                        STUDENT DEMOCRACY POLL
                                    </span>
                                    <h3 className="font-serif text-xl font-bold text-[#1F3A2D] m-0">
                                        {activePollObj?.title || "Next Month Mess Menu Selection"}
                                    </h3>
                                </div>
                            </div>

                            <div className="text-right font-mono text-xs">
                                <span className="text-emerald-900/60 block">Total Student Votes</span>
                                <span className="font-bold text-[#1F3A2D]">{totalPollVotes} Votes Recorded</span>
                            </div>
                        </div>

                        {voteSuccessMsg && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>{voteSuccessMsg}</span>
                            </div>
                        )}

                        {loadingPoll ? (
                            <LoadingSkeleton count={2} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {optionsWithTally.map((option: any) => {
                                    const isMyVote = myVotedOptionId === option.optionId;

                                    return (
                                        <div
                                            key={option.optionId}
                                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                                                isMyVote ? "border-[#1F3A2D] ring-2 ring-[#1F3A2D]/20 bg-emerald-50/30" : "border-emerald-900/10 bg-white"
                                            }`}
                                        >
                                            <div>
                                                {/* Image uploaded by Admin */}
                                                <div className="relative h-48 w-full bg-emerald-900/5 overflow-hidden">
                                                    {option.image ? (
                                                        <img
                                                            src={option.image}
                                                            alt={option.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-emerald-900/40">
                                                            <ImageIcon className="w-8 h-8 mb-1" />
                                                            <span className="text-xs font-mono">Menu Chart Image</span>
                                                        </div>
                                                    )}

                                                    {isMyVote && (
                                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#1F3A2D] text-[#D8B56A] text-[0.68rem] font-bold uppercase shadow-md flex items-center gap-1">
                                                            <Check className="w-3.5 h-3.5" /> Your Voted Choice
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5 space-y-3">
                                                    <h4 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">
                                                        {option.title}
                                                    </h4>
                                                    <p className="text-xs text-emerald-900/70 leading-relaxed m-0">
                                                        {option.description}
                                                    </p>

                                                    {/* Highlights */}
                                                    {(option.highlights || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {option.highlights.map((item: string, i: number) => (
                                                                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-900/5 text-[0.68rem] font-semibold text-[#1F3A2D]">
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 pt-0 space-y-3">
                                                {/* Live Vote Percentage Bar */}
                                                <div>
                                                    <div className="flex justify-between text-xs font-mono font-bold mb-1 text-[#1F3A2D]">
                                                        <span>Community Preference</span>
                                                        <span>{option.percentage}% ({option.voteCount} votes)</span>
                                                    </div>
                                                    <div className="w-full h-2.5 rounded-full bg-emerald-900/10 overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#1F3A2D] rounded-full transition-all duration-500"
                                                            style={{ width: `${option.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => handleCastVote(option.optionId)}
                                                    disabled={votingOptionId === option.optionId || isMyVote}
                                                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                                                        isMyVote
                                                            ? "bg-[#1F3A2D] text-white cursor-default"
                                                            : "bg-emerald-900/5 hover:bg-[#1F3A2D] text-[#1F3A2D] hover:text-white border border-emerald-900/15"
                                                    }`}
                                                >
                                                    {votingOptionId === option.optionId
                                                        ? "Submitting Vote..."
                                                        : isMyVote
                                                        ? "Voted Plan"
                                                        : "Vote for Next Month Menu"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
