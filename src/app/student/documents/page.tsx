"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { FileCheck, AlertTriangle, UploadCloud } from "lucide-react";
import { apiPostForm } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";

export default function DocumentsPage() {
    const { user, refreshUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form states
    const [idFront, setIdFront] = useState<File | null>(null);
    const [idBack, setIdBack] = useState<File | null>(null);
    const [guardianIdFront, setGuardianIdFront] = useState<File | null>(null);
    const [guardianIdBack, setGuardianIdBack] = useState<File | null>(null);

    const isRejected = user?.verification?.documentVerificationStatus === "rejected";
    const isPending = user?.verification?.documentVerificationStatus === "pending";
    const isApproved = user?.verification?.documentVerificationStatus === "approved";

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (!idFront && !idBack && !guardianIdFront && !guardianIdBack) {
            setError("Please select at least one file to upload.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (idFront) formData.append("idFront", idFront);
            if (idBack) formData.append("idBack", idBack);
            if (guardianIdFront) formData.append("guardianIdFront", guardianIdFront);
            if (guardianIdBack) formData.append("guardianIdBack", guardianIdBack);

            await apiPostForm(API.upload.reupload, formData);
            
            // Clear form
            setIdFront(null);
            setIdBack(null);
            setGuardianIdFront(null);
            setGuardianIdBack(null);
            
            setSuccess("Documents successfully uploaded and are pending verification.");
            await refreshUser({ force: true });
        } catch (err: any) {
            setError(err.message || "Failed to upload documents. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-4xl text-charcoal">Documents</h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Manage your uploaded identification and compliance documents
                </p>
            </motion.div>

            {/* Status Alert */}
            {isRejected && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-status-danger-light border-l-4 border-status-danger p-5 rounded-r-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-status-danger font-semibold font-display text-lg">Documents Rejected</h3>
                            <p className="text-status-danger/80 text-sm mt-1">
                                Your recently uploaded documents were rejected for the following reason:
                            </p>
                            <p className="mt-2 font-medium bg-white/50 p-3 rounded text-status-danger/90">
                                "{user?.verification?.documentRejectionReason || 'Please provide clearer images of your ID.'}"
                            </p>
                            <p className="text-sm mt-3 text-status-danger/80">
                                Please re-upload the corrected documents using the form below.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {isPending && (
                <div className="bg-status-warning-light border border-status-warning/30 p-5 rounded-xl flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-status-warning shrink-0" />
                    <p className="text-status-warning font-medium">Your documents are currently under review by our team.</p>
                </div>
            )}

            {isApproved && (
                <div className="bg-status-success-light border border-status-success/30 p-5 rounded-xl flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-status-success shrink-0" />
                    <p className="text-status-success font-medium">All your documents have been successfully verified.</p>
                </div>
            )}

            {/* Upload Section (visible if rejected or pending, though mostly used for rejected) */}
            {(isRejected || isPending) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl border border-sand-dark p-6"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-sand-dark pb-4">
                        <UploadCloud className="w-5 h-5 text-terracotta-raw" />
                        <h2 className="font-display font-medium text-xl text-charcoal">Update Documents</h2>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-status-danger-light text-status-danger rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-status-success-light text-status-success rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal ID */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-charcoal text-sm mb-2">Personal ID Proof</h3>
                                    <p className="text-xs text-charcoal/50 mb-3">Upload clear images of your primary ID</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal/70 mb-1">Front Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand-light file:text-charcoal hover:file:bg-sand-dark cursor-pointer border border-sand-dark rounded-xl p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal/70 mb-1">Back Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand-light file:text-charcoal hover:file:bg-sand-dark cursor-pointer border border-sand-dark rounded-xl p-2"
                                    />
                                </div>
                            </div>

                            {/* Guardian ID */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-charcoal text-sm mb-2">Guardian ID Proof</h3>
                                    <p className="text-xs text-charcoal/50 mb-3">Upload clear images of guardian's ID</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal/70 mb-1">Front Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => setGuardianIdFront(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand-light file:text-charcoal hover:file:bg-sand-dark cursor-pointer border border-sand-dark rounded-xl p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal/70 mb-1">Back Image</label>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => setGuardianIdBack(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand-light file:text-charcoal hover:file:bg-sand-dark cursor-pointer border border-sand-dark rounded-xl p-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-sand-dark flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || (!idFront && !idBack && !guardianIdFront && !guardianIdBack)}
                                className="min-w-[150px]"
                            >
                                {isSubmitting ? "Uploading..." : "Upload Documents"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Current Documents Viewer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <FileCheck className="w-5 h-5 text-charcoal/60" />
                    <span className="font-body font-medium text-charcoal">Current Documents on File</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 border border-sand-dark rounded-xl bg-sand-light/30">
                        <p className="text-xs text-charcoal/60 mb-2">Personal ID (Front)</p>
                        {user?.userIdProof?.frontImage ? (
                            <a href={user.userIdProof.frontImage} target="_blank" rel="noopener noreferrer" className="text-terracotta text-sm font-medium hover:underline">View File</a>
                        ) : (
                            <p className="text-charcoal/30 text-sm">Not found</p>
                        )}
                    </div>
                    <div className="p-4 border border-sand-dark rounded-xl bg-sand-light/30">
                        <p className="text-xs text-charcoal/60 mb-2">Personal ID (Back)</p>
                        {user?.userIdProof?.backImage ? (
                            <a href={user.userIdProof.backImage} target="_blank" rel="noopener noreferrer" className="text-terracotta text-sm font-medium hover:underline">View File</a>
                        ) : (
                            <p className="text-charcoal/30 text-sm">Not found</p>
                        )}
                    </div>
                    <div className="p-4 border border-sand-dark rounded-xl bg-sand-light/30">
                        <p className="text-xs text-charcoal/60 mb-2">Guardian ID (Front)</p>
                        {user?.guardianDetails?.idProof?.frontImage ? (
                            <a href={user.guardianDetails.idProof.frontImage} target="_blank" rel="noopener noreferrer" className="text-terracotta text-sm font-medium hover:underline">View File</a>
                        ) : (
                            <p className="text-charcoal/30 text-sm">Not found</p>
                        )}
                    </div>
                    <div className="p-4 border border-sand-dark rounded-xl bg-sand-light/30">
                        <p className="text-xs text-charcoal/60 mb-2">Guardian ID (Back)</p>
                        {user?.guardianDetails?.idProof?.backImage ? (
                            <a href={user.guardianDetails.idProof.backImage} target="_blank" rel="noopener noreferrer" className="text-terracotta text-sm font-medium hover:underline">View File</a>
                        ) : (
                            <p className="text-charcoal/30 text-sm">Not found</p>
                        )}
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
