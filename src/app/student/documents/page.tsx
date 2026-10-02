"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPostForm } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { useToast } from "@/components/ui/Toast";
import {
    FileCheck, ShieldCheck, Upload, AlertCircle, RefreshCw,
    CheckCircle2, XCircle, Clock, Loader2, X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

/** Convert a base64 data URL to a File object. */
function dataURLtoFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
}

interface UploadedFile {
    name: string;
    preview: string;
}

/** Compress images > 1MB, pass PDFs through directly. */
async function compressImageIfNeeded(
    file: File,
    maxDim = 1600,
    quality = 0.85
): Promise<UploadedFile> {
    if (!file.type.startsWith("image/")) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, preview: reader.result as string });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    if (file.size <= 1024 * 1024) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, preview: reader.result as string });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
                    else { width = Math.round((width * maxDim) / height); height = maxDim; }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL("image/jpeg", quality);
                    resolve({ name: file.name.replace(/\.[^/.]+$/, "") + ".jpg", preview: dataUrl });
                    return;
                }
                resolve({ name: file.name, preview: e.target?.result as string });
            };
            img.onerror = () => resolve({ name: file.name, preview: e.target?.result as string });
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

function ReuploadSlot({
    label,
    file,
    onSelect,
    onRemove,
}: {
    label: string;
    file: UploadedFile | null;
    onSelect: (f: UploadedFile) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hovered, setHovered] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (selected.size > 15 * 1024 * 1024) {
            setError("File too large (max 15 MB)");
            return;
        }
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowed.includes(selected.type)) {
            setError("Only JPEG, PNG, WebP, or PDF allowed");
            return;
        }
        setError(null);
        setProcessing(true);
        try {
            const processed = await compressImageIfNeeded(selected);
            onSelect(processed);
        } catch {
            setError("Could not read file. Try another.");
        } finally {
            setProcessing(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const isPdf = file?.name?.toLowerCase().endsWith(".pdf");

    return (
        <div>
            <span className="block mb-2 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-emerald-900/50">
                {label}
            </span>
            {file ? (
                <div className="relative rounded-xl border-2 border-emerald-800 overflow-hidden" style={{ aspectRatio: "3/2" }}>
                    {isPdf ? (
                        <div className="w-full h-full bg-emerald-900/5 flex flex-col items-center justify-center gap-2">
                            <FileCheck className="w-8 h-8 text-emerald-700" />
                            <span className="font-mono text-[0.65rem] text-emerald-800 truncate max-w-[90%]">{file.name}</span>
                        </div>
                    ) : (
                        <img src={file.preview} alt={label} className="w-full h-full object-cover" />
                    )}
                    <button
                        onClick={onRemove}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer shadow-md hover:bg-red-50 transition-colors"
                        title="Remove"
                    >
                        <X size={14} color="#c0392b" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={processing}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="w-full rounded-xl transition-all"
                    style={{
                        aspectRatio: "3/2",
                        border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
                        background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)",
                        cursor: processing ? "wait" : "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
                        {processing ? (
                            <Loader2 size={18} color={GREEN} className="animate-spin" />
                        ) : (
                            <Upload size={18} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
                        )}
                    </div>
                    <span className="font-mono text-[0.65rem]" style={{ color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>
                        {processing ? "Processing..." : "Click to upload"}
                    </span>
                </button>
            )}
            {error && (
                <p className="font-mono text-[0.6rem] text-red-600 mt-1">{error}</p>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleChange}
                style={{ display: "none" }}
            />
        </div>
    );
}

export default function DocumentsPage() {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();

    const verification = user?.verification || {};
    const docStatus = (verification.documentVerificationStatus || "pending") as string;
    const rejectionReason = verification.documentRejectionReason || null;
    const isRejected = docStatus === "rejected";
    const isApproved = docStatus === "approved";

    const proofs = user?.userIdProof || {};
    const guardianProofs = user?.guardianDetails?.idProof || {};

    // Re-upload state
    const [reuploadMode, setReuploadMode] = useState(false);
    const [idFront, setIdFront] = useState<UploadedFile | null>(null);
    const [idBack, setIdBack] = useState<UploadedFile | null>(null);
    const [guardianIdFront, setGuardianIdFront] = useState<UploadedFile | null>(null);
    const [guardianIdBack, setGuardianIdBack] = useState<UploadedFile | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const hasAnyNewFile = idFront || idBack || guardianIdFront || guardianIdBack;

    const handleReupload = async () => {
        if (!hasAnyNewFile) {
            showToast("Please select at least one document to re-upload", "error");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();

            if (idFront?.preview?.startsWith("data:")) {
                formData.append("idFront", dataURLtoFile(idFront.preview, idFront.name));
            }
            if (idBack?.preview?.startsWith("data:")) {
                formData.append("idBack", dataURLtoFile(idBack.preview, idBack.name));
            }
            if (guardianIdFront?.preview?.startsWith("data:")) {
                formData.append("guardianIdFront", dataURLtoFile(guardianIdFront.preview, guardianIdFront.name));
            }
            if (guardianIdBack?.preview?.startsWith("data:")) {
                formData.append("guardianIdBack", dataURLtoFile(guardianIdBack.preview, guardianIdBack.name));
            }

            await apiPostForm(API.upload.reupload, formData);
            await refreshUser({ force: true });

            // Reset state
            setIdFront(null);
            setIdBack(null);
            setGuardianIdFront(null);
            setGuardianIdBack(null);
            setReuploadMode(false);

            showToast("Documents re-uploaded successfully! They are now under review.", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Re-upload failed. Please try again.";
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const statusConfig = isApproved
        ? { label: "APPROVED", badge: "COMPLIANT", color: "text-emerald-800", bg: "bg-emerald-500/10", icon: CheckCircle2 }
        : isRejected
            ? { label: "REJECTED", badge: "ACTION REQUIRED", color: "text-red-700", bg: "bg-red-500/10", icon: XCircle }
            : { label: "PENDING", badge: "UNDER REVIEW", color: "text-amber-700", bg: "bg-amber-500/10", icon: Clock };

    const StatusIcon = statusConfig.icon;

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Document & KYC Compliance"
                    subtitle="Review verified identification scans and guardian compliance records"
                    badge="KYC STATUS"
                />

                {/* ── Rejection Alert Banner ────────────────── */}
                {isRejected && (
                    <div
                        className="p-5 rounded-2xl border shadow-sm"
                        style={{
                            background: "linear-gradient(135deg, rgba(192,57,43,0.06), rgba(192,57,43,0.02))",
                            borderColor: "rgba(192,57,43,0.2)",
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-serif text-lg font-bold text-red-800 m-0 mb-1">
                                    Documents Rejected
                                </h3>
                                {rejectionReason && (
                                    <p className="font-body text-sm text-red-700/80 mb-3 leading-relaxed">
                                        <strong>Reason:</strong> {rejectionReason}
                                    </p>
                                )}
                                <p className="font-mono text-xs text-red-600/60 mb-4">
                                    Please re-upload corrected documents below. Your verification will restart once submitted.
                                </p>
                                {!reuploadMode && (
                                    <button
                                        onClick={() => setReuploadMode(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-all hover:shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${GREEN}, #162b1e)`,
                                            color: GOLD,
                                            border: "none",
                                        }}
                                    >
                                        <RefreshCw size={14} />
                                        Re-upload Documents
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Overall Verification Status Card ──── */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${statusConfig.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                            <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block">
                                Verification Status
                            </span>
                            <span className={`font-serif text-xl font-bold uppercase ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    <span className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.badge}
                    </span>
                </div>

                {/* ── Re-upload Form (shown when rejected & user clicks re-upload) ── */}
                {reuploadMode && (
                    <div className="p-6 rounded-2xl bg-white border-2 border-emerald-800/20 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">
                                        Re-upload Documents
                                    </h3>
                                    <p className="font-mono text-[0.6rem] text-emerald-900/40 tracking-wider uppercase m-0">
                                        Upload only the documents that need correction
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReuploadMode(false);
                                    setIdFront(null);
                                    setIdBack(null);
                                    setGuardianIdFront(null);
                                    setGuardianIdBack(null);
                                }}
                                className="w-8 h-8 rounded-full border border-emerald-900/10 bg-white flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors"
                            >
                                <X size={16} color="rgba(31,58,45,0.4)" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <ReuploadSlot label="Student ID — Front" file={idFront} onSelect={setIdFront} onRemove={() => setIdFront(null)} />
                            <ReuploadSlot label="Student ID — Back" file={idBack} onSelect={setIdBack} onRemove={() => setIdBack(null)} />
                            <ReuploadSlot label="Guardian ID — Front" file={guardianIdFront} onSelect={setGuardianIdFront} onRemove={() => setGuardianIdFront(null)} />
                            <ReuploadSlot label="Guardian ID — Back" file={guardianIdBack} onSelect={setGuardianIdBack} onRemove={() => setGuardianIdBack(null)} />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-emerald-900/10">
                            <p className="font-mono text-[0.6rem] text-emerald-900/35 tracking-wide">
                                {hasAnyNewFile
                                    ? `${[idFront, idBack, guardianIdFront, guardianIdBack].filter(Boolean).length} document(s) selected`
                                    : "No documents selected yet"}
                            </p>
                            <button
                                onClick={handleReupload}
                                disabled={submitting || !hasAnyNewFile}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all"
                                style={{
                                    background: hasAnyNewFile
                                        ? `linear-gradient(135deg, ${GREEN}, #162b1e)`
                                        : "rgba(31,58,45,0.15)",
                                    color: hasAnyNewFile ? GOLD : "rgba(31,58,45,0.35)",
                                    border: "none",
                                    cursor: submitting || !hasAnyNewFile ? "not-allowed" : "pointer",
                                    boxShadow: hasAnyNewFile ? "0 4px 14px rgba(31,58,45,0.2)" : "none",
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={14} />
                                        Submit for Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Document Scans Grid ────────────────── */}
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
