"use client";
import React, { useState } from "react";
import DuoButton from "@/components/ui/DuoButton";

export default function ReportModal({
  isOpen = false,
  commentId = null,
  authorName = "",
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [reason, setReason] = useState("spam");
  const [customDetail, setCustomDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        commentId,
        reason,
        detail: customDetail,
      });
      setSubmitting(false);
      onClose();
    }, 400);
  };

  const REASONS = [
    { id: "spam", label: "Nội dung rác hoặc quảng cáo (Spam)" },
    { id: "offtopic", label: "Lạc đề / Không liên quan đến bài toán" },
    { id: "abusive", label: "Ngôn từ xúc phạm, thiếu văn hóa hoặc công kích" },
    { id: "other", label: "Lý do khác" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/20 cut-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚩</span>
            <span>Báo cáo bình luận</span>
          </h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Bạn đang báo cáo bình luận của{" "}
          <strong className="text-cyan-300 font-mono">@{authorName}</strong>. Vui
          lòng chọn lý do vi phạm:
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                  reason === r.id
                    ? "bg-pink-500/15 border-pink-500/50 text-white font-medium"
                    : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="accent-pink-500"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          {reason === "other" && (
            <textarea
              rows={2}
              placeholder="Mô tả chi tiết vi phạm..."
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              className="w-full mt-2 p-2.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <DuoButton variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Hủy
            </DuoButton>
            <DuoButton
              variant="danger"
              size="sm"
              type="submit"
              loading={submitting}
            >
              Gửi báo cáo
            </DuoButton>
          </div>
        </form>
      </div>
    </div>
  );
}
