"use client";

import { useAuth } from "@/context/AuthContext";
import { FileCheck, ShieldCheck, Upload, AlertCircle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DocumentsPage() {
    const { user } = useAuth();

    const verification = user?.verification || {};
    const docStatus = verification.documentVerificationStatus || "pending";
    const proofs = user?.userIdProof || {};
    const guardianProofs = user?.guardianDetails?.idProof || {};

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Document & KYC Compliance"
                    subtitle="Review verified identification scans and guardian compliance records"
                    badge="KYC STATUS"
                />

                {/* Overall Verification Status Card */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block">
                                Verification Status
                            </span>
                            <span className="font-serif text-xl font-bold text-[#1F3A2D] uppercase">
                                {docStatus}
                            </span>
                        </div>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase bg-emerald-500/10 text-emerald-800">
                        {docStatus === "approved" || docStatus === "verified" ? "COMPLIANT" : "UNDER REVIEW"}
                    </span>
                </div>

                {/* Document Scans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Student ID Proof Card */}
                    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Student Aadhaar / ID Proof</h3>
                            <FileCheck className="w-5 h-5 text-emerald-900/40" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {proofs.frontImage ? (
                                <a href={proofs.frontImage} target="_blank" rel="noopener noreferrer" className="group relative">
                                    <img src={proofs.frontImage} alt="Front ID" className="w-full h-28 object-cover rounded-xl border border-emerald-900/10 group-hover:scale-105 transition-all" />
                                    <span className="text-[0.65rem] font-bold text-[#1F3A2D] mt-1 block">ID Front Scan</span>
                                </a>
                            ) : (
                                <div className="h-28 rounded-xl bg-emerald-900/5 border border-dashed border-emerald-900/20 flex flex-col items-center justify-center text-xs text-emerald-900/40">
                                    No Front Image
                                </div>
                            )}

                            {proofs.backImage ? (
                                <a href={proofs.backImage} target="_blank" rel="noopener noreferrer" className="group relative">
                                    <img src={proofs.backImage} alt="Back ID" className="w-full h-28 object-cover rounded-xl border border-emerald-900/10 group-hover:scale-105 transition-all" />
                                    <span className="text-[0.65rem] font-bold text-[#1F3A2D] mt-1 block">ID Back Scan</span>
                                </a>
                            ) : (
                                <div className="h-28 rounded-xl bg-emerald-900/5 border border-dashed border-emerald-900/20 flex flex-col items-center justify-center text-xs text-emerald-900/40">
                                    No Back Image
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Guardian ID Proof Card */}
                    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Guardian ID Proof</h3>
                            <FileCheck className="w-5 h-5 text-emerald-900/40" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {guardianProofs.frontImage ? (
                                <a href={guardianProofs.frontImage} target="_blank" rel="noopener noreferrer" className="group relative">
                                    <img src={guardianProofs.frontImage} alt="Guardian Front ID" className="w-full h-28 object-cover rounded-xl border border-emerald-900/10 group-hover:scale-105 transition-all" />
                                    <span className="text-[0.65rem] font-bold text-[#1F3A2D] mt-1 block">Guardian ID Front</span>
                                </a>
                            ) : (
                                <div className="h-28 rounded-xl bg-emerald-900/5 border border-dashed border-emerald-900/20 flex flex-col items-center justify-center text-xs text-emerald-900/40">
                                    No Guardian Front
                                </div>
                            )}

                            {guardianProofs.backImage ? (
                                <a href={guardianProofs.backImage} target="_blank" rel="noopener noreferrer" className="group relative">
                                    <img src={guardianProofs.backImage} alt="Guardian Back ID" className="w-full h-28 object-cover rounded-xl border border-emerald-900/10 group-hover:scale-105 transition-all" />
                                    <span className="text-[0.65rem] font-bold text-[#1F3A2D] mt-1 block">Guardian ID Back</span>
                                </a>
                            ) : (
                                <div className="h-28 rounded-xl bg-emerald-900/5 border border-dashed border-emerald-900/20 flex flex-col items-center justify-center text-xs text-emerald-900/40">
                                    No Guardian Back
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
