"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  MoreHorizontal,
  X,
  Shield,
  Bookmark,
  Trash2,
  Edit3,
  AlertCircle,
  Loader,
  Search,
  TrendingUp,
  Clock,
  Flame,
  ChevronDown,
  Lock,
  Send,
  CheckCircle2,
  Award,
  Star,
} from "lucide-react";
import { communityService, ICommunityPost, IComment } from "@/lib/community-client";
import { useAuth } from "@/context/AuthContext";

interface CreatePostData {
  content: string;
  category: string;
  isAnonymous: boolean;
}

type SortMode = "recent" | "popular" | "saved";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

const C = {
  teal: "#4A7C7C",
  tealDark: "#3a6060",
  tealLight: "#CFE1E1",
  tealFaint: "#EBF4F4",
  green: "#86D293",
  greenDark: "#5fa86e",
  greenFaint: "#EAF7ED",
  ink: "#0f2420",
  inkMid: "#2d4a47",
  inkMuted: "#6b8a87",
  surface: "#FFFFFF",
  offWhite: "#F4F9F8",
  border: "#DDE9E8",
  danger: "#dc2626",
  dangerFaint: "#fef2f2",
  warn: "#b45309",
  warnFaint: "#fef9e7",
};

const CATEGORIES = [
  "All",
  "Alcohol Recovery",
  "Substance Recovery",
  "Family Support",
  "Success Story",
  "CBT Wins",
  "General Support",
];

const CAT_CFG: Record<string, { color: string; bg: string; Icon: React.FC<any> }> = {
  "Alcohol Recovery": { color: C.warn, bg: C.warnFaint, Icon: Award },
  "Substance Recovery": { color: C.danger, bg: C.dangerFaint, Icon: Flame },
  "Family Support": { color: "#6d28d9", bg: "#f5f3ff", Icon: Heart },
  "Success Story": { color: C.greenDark, bg: C.greenFaint, Icon: Star },
  "CBT Wins": { color: "#0284c7", bg: "#f0f9ff", Icon: CheckCircle2 },
  "General Support": { color: C.teal, bg: C.tealFaint, Icon: Shield },
};

const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 20,
  boxShadow: "0 2px 12px rgba(74,124,124,.06)",
};

const sLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: C.inkMuted,
  marginBottom: 10,
};

const formatTimeAgo = (date: string | Date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return postDate.toLocaleDateString();
};

function Avatar({ name, size = 36, anon = false }: { name: string; size?: number; anon?: boolean }) {
  const initial = (name || "A").charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: anon
          ? `linear-gradient(135deg, ${C.inkMuted}, ${C.inkMid})`
          : `linear-gradient(135deg, ${C.teal}, ${C.green})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 2px 8px ${C.teal}25`,
      }}
    >
      {anon ? (
        <Lock size={size * 0.38} strokeWidth={2} color="rgba(255,255,255,.8)" />
      ) : (
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: size * 0.4,
            fontWeight: 400,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

function CatPill({ category }: { category: string }) {
  const cfg = CAT_CFG[category];
  if (!cfg) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".04em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}25`,
      }}
    >
      <cfg.Icon size={10} strokeWidth={2.5} />
      {category}
    </span>
  );
}

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "error" ? C.dangerFaint : type === "info" ? C.tealFaint : C.greenFaint;
  const border = type === "error" ? "#fca5a5" : type === "info" ? C.tealLight : "#b0dfc4";
  const color = type === "error" ? C.danger : type === "info" ? C.tealDark : "#166534";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,.1)",
        zIndex: 9999,
        maxWidth: 340,
        fontFamily: "'DM Sans', sans-serif",
        animation: "slideIn .25s ease",
      }}
    >
      <CheckCircle2 size={16} strokeWidth={2} color={color} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color }}>{msg}</span>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer", color, display: "flex" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
  isLoading: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Alcohol Recovery");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!content.trim()) {
      setError("Please write something");
      return;
    }

    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters");
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        category,
        isAnonymous,
      });

      setContent("");
      setCategory("Alcohol Recovery");
      setIsAnonymous(true);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,36,32,.45)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
    >
      <div
        style={{
          ...card,
          padding: "28px",
          width: "100%",
          maxWidth: 520,
          animation: "scaleIn .25s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: C.ink }}>
            Share with the community
          </p>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              background: C.offWhite,
              border: "none",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} strokeWidth={2} color={C.inkMuted} />
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              background: C.dangerFaint,
              border: `1px solid #fecaca`,
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 12,
              color: C.danger,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <p style={sLabel}>Category</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.slice(1).map((cat) => {
              const cfg = CAT_CFG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1.5px solid ${category === cat ? cfg?.color || C.teal : C.border}`,
                    background: category === cat ? cfg?.bg || C.tealFaint : C.surface,
                    color: category === cat ? cfg?.color || C.teal : C.inkMuted,
                    fontSize: 12,
                    fontWeight: category === cat ? 600 : 400,
                    cursor: "pointer",
                    transition: "all .15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {cfg ? <cfg.Icon size={12} strokeWidth={2} /> : null}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={sLabel}>Your message</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Share your thoughts, progress, or a question..."
            maxLength={2000}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: `1.5px solid ${C.border}`,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              resize: "vertical",
              outline: "none",
              color: C.ink,
              background: C.offWhite,
              boxSizing: "border-box",
              transition: "border .15s",
              lineHeight: 1.6,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
            disabled={isLoading}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: C.inkMuted, marginTop: 4 }}>
            {content.length}/2000
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            background: C.offWhite,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Lock size={15} strokeWidth={2} color={C.inkMuted} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.inkMid }}>Post anonymously</p>
              <p style={{ fontSize: 11, color: C.inkMuted }}>Your name will be hidden from others</p>
            </div>
          </div>
          <button
            onClick={() => setIsAnonymous((a) => !a)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 999,
              border: "none",
              background: isAnonymous ? C.teal : C.border,
              cursor: "pointer",
              transition: "background .2s",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: isAnonymous ? 23 : 3,
                transition: "left .2s",
                boxShadow: "0 1px 4px rgba(0,0,0,.15)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: C.surface,
              color: C.inkMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background:
                content.trim() && !isLoading
                  ? `linear-gradient(135deg, ${C.teal}, ${C.green})`
                  : C.border,
              color: content.trim() && !isLoading ? "#fff" : C.inkMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: content.trim() && !isLoading ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              transition: "all .2s",
            }}
          >
            {isLoading ? "Posting..." : <><Send size={14} strokeWidth={2} /> Share Post</>}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: string;
  comments: IComment[];
  isExpanded: boolean;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  currentUserId?: string;
  isLoading: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  isExpanded,
  onAddComment,
  onDeleteComment,
  currentUserId,
  isLoading,
}) => {
  const [value, setValue] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!value.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    if (value.trim().length < 2) {
      setError("Comment must be at least 2 characters");
      return;
    }

    setLocalLoading(true);
    try {
      await onAddComment(postId, value.trim());
      setValue("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isExpanded) return null;

  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
      {comments.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {comments.map((comment) => (
            <div key={comment._id} style={{ display: "flex", gap: 10 }}>
              <Avatar name={comment.authorName} size={28} />
              <div
                style={{
                  flex: 1,
                  background: C.offWhite,
                  borderRadius: "0 12px 12px 12px",
                  padding: "10px 14px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.inkMid }}>{comment.authorName}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: C.inkMuted }}>{formatTimeAgo(comment.createdAt)}</span>
                    {comment.userId === currentUserId && comment._id && (
                      <button
                        onClick={() => onDeleteComment(postId, comment._id || "")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.danger,
                          padding: "2px 4px",
                          borderRadius: 6,
                        }}
                      >
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.5 }}>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 12 }}>No comments yet. Be the first!</p>
      )}

      {error && (
        <div
          style={{
            marginBottom: 8,
            background: C.dangerFaint,
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 12,
            color: C.danger,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a supportive comment..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            color: C.ink,
            background: C.offWhite,
          }}
          disabled={localLoading || isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !localLoading) submit();
          }}
        />
        <button
          onClick={submit}
          disabled={localLoading || isLoading || !value.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "none",
            background: value.trim() && !localLoading ? C.teal : C.border,
            color: "#fff",
            cursor: value.trim() && !localLoading ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Send size={15} strokeWidth={2} color={value.trim() && !localLoading ? "#fff" : C.inkMuted} />
        </button>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: ICommunityPost;
  isAuthor: boolean;
  onLike: (postId: string) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onEdit: (post: ICommunityPost) => void;
  onDelete: (postId: string) => Promise<void>;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  currentUserId?: string;
  isLoading: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  isAuthor,
  onLike,
  onSave,
  onEdit,
  onDelete,
  onAddComment,
  onDeleteComment,
  currentUserId,
  isLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const isLiked = !!post.isLikedByUser;
  const isSaved = !!post.isSavedByUser;

  const likeCount = post.likeCount ?? post.likes?.length ?? 0;
  const saveCount = post.saveCount ?? post.savedBy?.length ?? 0;
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      setLocalLoading(true);
      await onDelete(post._id);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      style={{ ...card, padding: "22px", transition: "box-shadow .2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(74,124,124,.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(74,124,124,.06)")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <Avatar name={post.authorName} size={40} anon={post.isAnonymous} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{post.authorName}</span>
            {post.isAnonymous && (
              <span
                style={{
                  fontSize: 11,
                  color: C.inkMuted,
                  background: C.offWhite,
                  border: `1px solid ${C.border}`,
                  padding: "1px 8px",
                  borderRadius: 999,
                }}
              >
                Anonymous
              </span>
            )}
            <CatPill category={post.category} />
            {post.isEdited && (
              <span style={{ fontSize: 11, color: C.inkMuted, fontStyle: "italic" }}>(edited)</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 3 }}>{formatTimeAgo(post.createdAt)}</p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.inkMuted,
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.offWhite)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 34,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(15,36,32,.12)",
                zIndex: 10,
                minWidth: 160,
                overflow: "hidden",
                animation: "fadeUp .15s ease",
              }}
            >
              {isAuthor && (
                <button
                  onClick={() => {
                    onEdit(post);
                    setMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    cursor: "pointer",
                    color: C.inkMid,
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left",
                  }}
                >
                  <Edit3 size={14} strokeWidth={2} />
                  Edit post
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={() => {
                    handleDelete();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    cursor: localLoading ? "not-allowed" : "pointer",
                    color: C.danger,
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left",
                  }}
                  disabled={localLoading || isLoading}
                >
                  <Trash2 size={14} strokeWidth={2} />
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontSize: 14,
          color: C.inkMid,
          lineHeight: 1.7,
          marginBottom: 14,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {post.content}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 4, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <button
          onClick={() => onLike(post._id)}
          disabled={localLoading || isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 10,
            border: "none",
            background: isLiked ? "#fef2f2" : "transparent",
            color: isLiked ? C.danger : C.inkMuted,
            fontSize: 13,
            fontWeight: isLiked ? 600 : 400,
            cursor: "pointer",
            transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Heart size={15} strokeWidth={2} fill={isLiked ? C.danger : "none"} color={isLiked ? C.danger : C.inkMuted} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 10,
            border: "none",
            background: expanded ? C.tealFaint : "transparent",
            color: expanded ? C.teal : C.inkMuted,
            fontSize: 13,
            fontWeight: expanded ? 600 : 400,
            cursor: "pointer",
            transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <MessageCircle size={15} strokeWidth={2} />
          {commentCount > 0 ? commentCount : "Reply"}
        </button>

        <button
          onClick={() => onSave(post._id)}
          disabled={localLoading || isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 10,
            border: "none",
            background: isSaved ? "#f0f9ff" : "transparent",
            color: isSaved ? "#0284c7" : C.inkMuted,
            fontSize: 13,
            fontWeight: isSaved ? 600 : 400,
            cursor: "pointer",
            transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Bookmark size={15} strokeWidth={2} fill={isSaved ? "#0284c7" : "none"} color={isSaved ? "#0284c7" : C.inkMuted} />
          {saveCount > 0 && saveCount}
        </button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.inkMuted }}>
          {commentCount} comment{commentCount !== 1 ? "s" : ""}
        </span>
      </div>

      {expanded && (
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          isExpanded={expanded}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
          isLoading={localLoading || isLoading}
        />
      )}
    </div>
  );
};

const Community = () => {
  const { user } = useAuth();
  const [communityFilter, setCommunityFilter] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ICommunityPost | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const [communityPosts, setCommunityPosts] = useState<ICommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
  }, []);

  const loadFeed = useCallback(
    async (skip: number = 0) => {
      try {
        setIsLoading(true);
        setError("");
        const response = await communityService.getFeed(communityFilter, 10, skip);
        if (skip === 0) {
          setCommunityPosts(response.posts);
        } else {
          setCommunityPosts((prev) => [...prev, ...response.posts]);
        }
        setHasMore(response.hasMore);
        setPage(skip / 10);
      } catch (err: any) {
        setError(err.message || "Failed to load feed");
      } finally {
        setIsLoading(false);
      }
    },
    [communityFilter]
  );

  useEffect(() => {
    loadFeed(0);
  }, [loadFeed]);

  const handleCreatePost = async (data: CreatePostData) => {
    try {
      setIsLoading(true);
      const response = await communityService.createPost(
        data.content,
        data.category,
        data.isAnonymous
      );
      setCommunityPosts((prev) => [response.post, ...prev]);
      showToast("Post shared with the community!", "success");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;

    setEditError("");

    if (!editContent.trim()) {
      setEditError("Content cannot be empty");
      return;
    }

    if (editContent.trim().length < 10) {
      setEditError("Content must be at least 10 characters");
      return;
    }

    try {
      setIsLoading(true);
      const response = await communityService.updatePost(editingPost._id, editContent.trim());

      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === response.post._id ? response.post : post))
      );

      setShowEditModal(false);
      setEditingPost(null);
      setEditContent("");
      showToast("Post updated", "success");
    } catch (err: any) {
      setEditError(err.message || "Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setIsLoading(true);
      await communityService.deletePost(postId);
      setCommunityPosts((prev) => prev.filter((post) => post._id !== postId));
      showToast("Post deleted", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await communityService.toggleLike(postId);
      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === response.post._id ? response.post : post))
      );
    } catch {
      showToast("Failed to update like", "error");
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const response = await communityService.toggleSave(postId);
      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === response.post._id ? response.post : post))
      );
      showToast(response.isSaved ? "Post saved" : "Post unsaved", "info");
    } catch {
      showToast("Failed to update save", "error");
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const response = await communityService.addComment(postId, content);
      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === response.post._id ? response.post : post))
      );
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await communityService.deleteComment(postId, commentId);
      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === response.post._id ? response.post : post))
      );
    } catch {
      showToast("Failed to delete comment", "error");
    }
  };

  const displayPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? communityPosts.filter(
          (post) =>
            post.content.toLowerCase().includes(q) ||
            post.authorName.toLowerCase().includes(q) ||
            post.category.toLowerCase().includes(q)
        )
      : [...communityPosts];

    if (sortMode === "saved") {
      return filtered.filter((post) => !!post.isSavedByUser);
    }

    if (sortMode === "popular") {
      return filtered.sort(
        (a, b) => (b.likeCount ?? b.likes?.length ?? 0) - (a.likeCount ?? a.likes?.length ?? 0)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [communityPosts, search, sortMode]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayPosts = communityPosts.filter((post) => {
      const d = new Date(post.createdAt);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }).length;

    const uniqueAuthors = new Set(communityPosts.map((p) => p.authorName)).size;

    return {
      totalPosts: communityPosts.length,
      totalMembers: uniqueAuthors,
      postsToday: todayPosts,
    };
  }, [communityPosts]);

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.96);        } to { opacity:1; transform:scale(1); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(12px);  } to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .community-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .feed-layout { display: flex; flex-direction: column; gap: 16px; }
        @media (max-width: 1024px) {
          .community-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 6, letterSpacing: ".03em" }}>
              Portal &rsaquo; <strong style={{ color: C.inkMid, fontWeight: 600 }}>Community</strong>
            </p>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 34,
                fontWeight: 400,
                color: C.ink,
                letterSpacing: "-.3px",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Community Feed
            </h1>
            <p style={{ fontSize: 14, color: C.inkMuted }}>Share, support, and celebrate together</p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: `0 4px 16px ${C.teal}30`,
            }}
            disabled={isLoading}
          >
            <Plus size={16} strokeWidth={2.5} /> New Post
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              background: C.dangerFaint,
              border: "1px solid #fecaca",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
              color: C.danger,
              fontSize: 13,
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { Icon: Users, label: "Members", val: stats.totalMembers || "-", color: C.teal, bg: C.tealFaint },
            {
              Icon: MessageCircle,
              label: "Total Posts",
              val: stats.totalPosts || "0",
              color: C.greenDark,
              bg: C.greenFaint,
            },
            { Icon: Flame, label: "Posts Today", val: stats.postsToday || "0", color: C.warn, bg: C.warnFaint },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                ...card,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <item.Icon size={18} strokeWidth={2} color={item.color} />
              </div>
              <div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 300, color: C.ink, lineHeight: 1 }}>
                  {item.val}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: C.inkMuted,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="community-grid">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <Search
                  size={15}
                  strokeWidth={2}
                  color={C.inkMuted}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 36px",
                    borderRadius: 12,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    color: C.ink,
                    background: C.surface,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 4, background: C.offWhite, borderRadius: 12, padding: 4 }}>
                {([
                  { id: "recent", Icon: Clock, label: "Recent" },
                  { id: "popular", Icon: TrendingUp, label: "Popular" },
                  { id: "saved", Icon: Bookmark, label: "Saved" },
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortMode(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 9,
                      border: "none",
                      background: sortMode === s.id ? C.surface : "transparent",
                      color: sortMode === s.id ? C.ink : C.inkMuted,
                      fontSize: 12,
                      fontWeight: sortMode === s.id ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: sortMode === s.id ? "0 1px 4px rgba(74,124,124,.08)" : "none",
                    }}
                  >
                    <s.Icon size={13} strokeWidth={2} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {CATEGORIES.map((cat) => {
                const cfg = CAT_CFG[cat];
                const active = communityFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setCommunityFilter(cat);
                      setPage(0);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: `1.5px solid ${active ? cfg?.color || C.teal : C.border}`,
                      background: active ? cfg?.bg || C.tealFaint : C.surface,
                      color: active ? cfg?.color || C.teal : C.inkMuted,
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all .15s",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {cfg && <cfg.Icon size={11} strokeWidth={2.5} />}
                    {cat === "All" ? "All Posts" : cat}
                  </button>
                );
              })}
            </div>

            {isLoading && communityPosts.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  gap: 12,
                }}
              >
                <Loader size={34} style={{ animation: "spin 1s linear infinite", color: C.teal }} />
                <p style={{ fontSize: 13, color: C.inkMuted }}>Loading community posts...</p>
              </div>
            ) : displayPosts.length === 0 ? (
              <div style={{ ...card, padding: "64px 32px", textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: C.offWhite,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Users size={24} strokeWidth={1.5} color={C.inkMuted} />
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.ink, marginBottom: 8 }}>
                  {search ? "No posts found" : "Be the first to post"}
                </p>
                <p style={{ fontSize: 14, color: C.inkMuted, marginBottom: 20 }}>
                  {search
                    ? "Try a different search term or category."
                    : "Share your journey and support others in their recovery."}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowPostModal(true)}
                    style={{
                      padding: "11px 28px",
                      borderRadius: 999,
                      border: "none",
                      background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Write the First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="feed-layout">
                {displayPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isAuthor={post.isAuthor || false}
                    onLike={handleLike}
                    onSave={handleSave}
                    onEdit={(selectedPost) => {
                      setEditingPost(selectedPost);
                      setEditContent(selectedPost.content);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDeletePost}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    currentUserId={user?.id}
                    isLoading={isLoading}
                  />
                ))}

                {hasMore && (
                  <button
                    onClick={() => loadFeed((page + 1) * 10)}
                    disabled={isLoading}
                    style={{
                      padding: "13px",
                      borderRadius: 14,
                      border: `1.5px solid ${C.border}`,
                      background: C.surface,
                      color: C.inkMid,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={15} style={{ animation: "spin 1s linear infinite", color: C.teal }} />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={15} strokeWidth={2} />
                        Load more posts
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 24, alignSelf: "start" }}>
            <div
              style={{
                ...card,
                padding: "20px",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                borderColor: "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Shield size={18} strokeWidth={2} color="#fff" />
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 400, color: "#fff" }}>
                  Community Guidelines
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Be kind and supportive with everyone",
                  "Respect anonymity choices",
                  "Share experiences, not medical advice",
                  "Celebrate every win, big or small",
                  "Flag harmful content to keep us safe",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        background: "rgba(255,255,255,.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: "20px" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 8 }}>
                Share your story
              </p>
              <p style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.6, marginBottom: 16 }}>
                Your journey could be exactly what someone else needs to read today.
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.offWhite,
                  color: C.inkMid,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Create a new post
              </button>
            </div>

            <div style={{ ...card, padding: "16px", background: C.offWhite, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 10 }}>
                <AlertCircle size={15} strokeWidth={2} color={C.inkMuted} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: C.inkMuted, lineHeight: 1.5 }}>
                  This community is a support space, not a replacement for professional help. If you are in crisis,
                  please contact a counselor or helpline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
        isLoading={isLoading}
      />

      {showEditModal && editingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,36,32,.45)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
        >
          <div style={{ ...card, padding: "28px", width: "100%", maxWidth: 520, fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: C.ink }}>Edit Post</p>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditError("");
                }}
                style={{
                  width: 32,
                  height: 32,
                  background: C.offWhite,
                  border: "none",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} strokeWidth={2} color={C.inkMuted} />
              </button>
            </div>

            {editError && (
              <div
                style={{
                  marginBottom: 14,
                  background: C.dangerFaint,
                  border: "1px solid #fecaca",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: C.danger,
                }}
              >
                {editError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <p style={sLabel}>Edit your message</p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                maxLength={2000}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  resize: "vertical",
                  outline: "none",
                  color: C.ink,
                  background: C.offWhite,
                  boxSizing: "border-box",
                }}
                disabled={isLoading}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: C.inkMuted, marginTop: 4 }}>
                {editContent.length}/2000
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditError("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: `1.5px solid ${C.border}`,
                  background: C.surface,
                  color: C.inkMuted,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditPost}
                disabled={isLoading || !editContent.trim()}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    editContent.trim() && !isLoading
                      ? `linear-gradient(135deg, ${C.teal}, ${C.green})`
                      : C.border,
                  color: editContent.trim() && !isLoading ? "#fff" : C.inkMuted,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: editContent.trim() && !isLoading ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Community;
