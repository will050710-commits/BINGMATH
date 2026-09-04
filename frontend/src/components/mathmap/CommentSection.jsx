"use client";
import React, { useState } from "react";
import DuoButton from "@/components/ui/DuoButton";
import RankBadge from "@/components/ui/RankBadge";
import ReportModal from "./ReportModal";

const INITIAL_COMMENTS = [
  {
    id: "c1",
    author: "minh_toan_hoc",
    avatarColor: "from-cyan-400 to-indigo-600",
    rank: "A",
    createdAt: "2 giờ trước",
    body: "Ở bài định lý Vi-ét, mình hay bị nhầm dấu âm dương khi tính tổng nghiệm S. Có bạn nào có mẹo nhớ nhanh không?",
    upvotes: 24,
    hasUpvoted: false,
    replies: [
      {
        id: "c1_r1",
        author: "co_giao_lan",
        avatarColor: "from-pink-500 to-violet-600",
        rank: "SS",
        createdAt: "1 giờ trước",
        body: "Mẹo nhỏ cho em: Tổng S = -b/a (nhớ luôn có dấu trừ đối xứng), Tích P = c/a. Thử áp dụng làm lại bài tập 4 xem đã vững chưa nhé!",
        upvotes: 41,
        hasUpvoted: true,
      },
    ],
  },
  {
    id: "c2",
    author: "huy_math99",
    avatarColor: "from-emerald-400 to-teal-600",
    rank: "B",
    createdAt: "5 giờ trước",
    body: "MathMap này các bài tập từ câu 5 trở đi rất sát đề thi học kỳ và đề khảo sát chất lượng, cảm ơn đội ngũ Duomath nhiều!",
    upvotes: 12,
    hasUpvoted: false,
    replies: [],
  },
  {
    id: "c3",
    author: "thu_trang_2k9",
    avatarColor: "from-amber-400 to-rose-500",
    rank: "S",
    createdAt: "1 ngày trước",
    body: "Phần hệ bất phương trình bậc hai có video hướng dẫn chi tiết không ạ? Mình cần ôn lại các dạng biện luận theo tham số.",
    upvotes: 8,
    hasUpvoted: false,
    replies: [],
  },
];

export default function CommentSection({
  mathmapId = "mm001",
  currentUser = { username: "BanHocSinh", rank: "A" },
}) {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [reportModal, setReportModal] = useState({ isOpen: false, commentId: null, authorName: "" });
  const [toastMessage, setToastMessage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    const newComment = {
      id: "c_" + Date.now(),
      author: currentUser.username || "Học Viên",
      avatarColor: "from-cyan-400 to-pink-500",
      rank: currentUser.rank || "A",
      createdAt: "Vừa xong",
      body: newCommentBody.trim(),
      upvotes: 0,
      hasUpvoted: false,
      replies: [],
    };

    setComments([newComment, ...comments]);
    setNewCommentBody("");
    showToast("🎉 Đã đăng bình luận thành công!");
  };

  const handlePostReply = (parentCommentId) => {
    if (!replyBody.trim()) return;

    const newReply = {
      id: "r_" + Date.now(),
      author: currentUser.username || "Học Viên",
      avatarColor: "from-cyan-400 to-pink-500",
      rank: currentUser.rank || "A",
      createdAt: "Vừa xong",
      body: replyBody.trim(),
      upvotes: 0,
      hasUpvoted: false,
    };

    setComments(
      comments.map((c) => {
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyingToId(null);
    setReplyBody("");
    showToast("💬 Đã gửi câu trả lời!");
  };

  const handleToggleUpvote = (commentId, isReply = false, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          const nextUpvoted = !c.hasUpvoted;
          return {
            ...c,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1),
          };
        }
        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId) {
                const nextUpvoted = !r.hasUpvoted;
                return {
                  ...r,
                  hasUpvoted: nextUpvoted,
                  upvotes: nextUpvoted ? r.upvotes + 1 : Math.max(0, r.upvotes - 1),
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  const handleReportSubmit = ({ commentId, reason }) => {
    showToast("🛡️ Cảm ơn bạn. Báo cáo vi phạm đã được gửi đến ban kiểm duyệt!");
  };

  const totalCommentCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="mt-12 pt-8 border-t border-white/10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 border border-cyan-400 text-cyan-200 text-sm font-medium rounded-xl shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        commentId={reportModal.commentId}
        authorName={reportModal.authorName}
        onClose={() => setReportModal({ isOpen: false, commentId: null, authorName: "" })}
        onSubmit={handleReportSubmit}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <span>💬</span>
          <span>Bình luận & Thảo luận</span>
          <span className="text-sm font-mono text-cyan-400 font-normal">
            ({totalCommentCount})
          </span>
        </h3>
      </div>

      {/* Top Composer */}
      <form onSubmit={handlePostComment} className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 shrink-0 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md select-none">
          {currentUser.username ? currentUser.username[0] : "U"}
        </div>

        <div className="flex-1 bg-slate-900/90 border border-white/10 rounded-xl p-2.5 focus-within:border-pink-500/50 transition-colors">
          <textarea
            rows={2}
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            placeholder="Đặt câu hỏi, chia sẻ mẹo giải hoặc đóng góp ý kiến cho MathMap này..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-1"
          />
          <div className="flex justify-end pt-2 border-t border-white/5">
            <DuoButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={!newCommentBody.trim()}
            >
              Gửi bình luận
            </DuoButton>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.slice(0, visibleCount).map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Top Level Comment */}
            <div className="flex gap-3.5 group">
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-tr ${comment.avatarColor || "from-cyan-400 to-indigo-600"} shrink-0 flex items-center justify-center font-bold text-xs text-white uppercase select-none`}
              >
                {comment.author[0]}
              </div>

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-100">
                    {comment.author}
                  </span>
                  <RankBadge rank={comment.rank || "A"} size="xs" />
                  <span className="text-[11px] font-mono text-slate-400">
                    {comment.createdAt}
                  </span>
                </div>

                {/* Body */}
                <p className="text-sm text-slate-300 leading-relaxed break-words font-normal">
                  {comment.body}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2 text-xs font-mono select-none">
                  <button
                    onClick={() => handleToggleUpvote(comment.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      comment.hasUpvoted
                        ? "text-cyan-400 font-bold"
                        : "text-slate-400 hover:text-cyan-300"
                    }`}
                  >
                    <span>▲</span>
                    <span>{comment.upvotes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setReplyingToId(
                        replyingToId === comment.id ? null : comment.id
                      )
                    }
                    className="flex items-center gap-1 text-slate-400 hover:text-pink-300 transition-colors font-sans cursor-pointer"
                  >
                    <span>↩</span>
                    <span>Trả lời</span>
                  </button>

                  <button
                    onClick={() =>
                      setReportModal({
                        isOpen: true,
                        commentId: comment.id,
                        authorName: comment.author,
                      })
                    }
                    className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors font-sans cursor-pointer"
                  >
                    <span>🚩</span>
                    <span>Báo cáo</span>
                  </button>
                </div>

                {/* Inline Reply Composer */}
                {replyingToId === comment.id && (
                  <div className="mt-3 flex gap-2.5 pl-2 border-l-2 border-pink-500/40 animate-fade-in">
                    <input
                      type="text"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder={`Trả lời @${comment.author}...`}
                      className="flex-1 bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePostReply(comment.id);
                        }
                      }}
                    />
                    <DuoButton
                      variant="primary"
                      size="sm"
                      onClick={() => handlePostReply(comment.id)}
                      disabled={!replyBody.trim()}
                    >
                      Gửi
                    </DuoButton>
                  </div>
                )}
              </div>
            </div>

            {/* Nested 1-Level Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-10 sm:ml-12 space-y-3.5 border-l border-white/10 pl-3 sm:pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${reply.avatarColor || "from-pink-500 to-violet-600"} shrink-0 flex items-center justify-center font-bold text-[10px] text-white uppercase select-none`}
                    >
                      {reply.author[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-100">
                          {reply.author}
                        </span>
                        <RankBadge rank={reply.rank || "SS"} size="xs" />
                        <span className="text-[10px] font-mono text-slate-400">
                          {reply.createdAt}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
                        {reply.body}
                      </p>

                      <div className="flex items-center gap-4 mt-1.5 text-xs font-mono select-none">
                        <button
                          onClick={() =>
                            handleToggleUpvote(reply.id, true, comment.id)
                          }
                          className={`flex items-center gap-1 transition-colors cursor-pointer ${
                            reply.hasUpvoted
                              ? "text-cyan-400 font-bold"
                              : "text-slate-400 hover:text-cyan-300"
                          }`}
                        >
                          <span>▲</span>
                          <span>{reply.upvotes}</span>
                        </button>

                        <button
                          onClick={() =>
                            setReportModal({
                              isOpen: true,
                              commentId: reply.id,
                              authorName: reply.author,
                            })
                          }
                          className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors font-sans cursor-pointer"
                        >
                          <span>🚩</span>
                          <span>Báo cáo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination "Xem thêm bình luận" */}
      {comments.length > visibleCount && (
        <div className="mt-8 text-center">
          <DuoButton
            variant="ghost"
            size="md"
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            Xem thêm bình luận ({comments.length - visibleCount} còn lại)
          </DuoButton>
        </div>
      )}
    </div>
  );
}
