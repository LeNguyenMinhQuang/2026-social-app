import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useToggleLike, useDeletePost } from "../hooks/usePosts";
import { useAuthStore } from "../../auth/store/authStore";
import { CommentList } from "./CommentList";
import type { Post } from "../../../types/post.types";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { mutate: toggleLike } = useToggleLike();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const isOwner = currentUser?.id === post.author._id;

  return (
    <div className="rounded-[10px] border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-line">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-sans text-xs text-ink/40">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-ink">{post.author.username}</p>
            <p className="font-sans text-xs text-ink/40">{dayjs(post.createdAt).fromNow()}</p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={() => deletePost(post.id)}
            disabled={isDeleting}
            className="text-ink/30 hover:text-coral"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {post.content && (
        <p className="mt-3 whitespace-pre-wrap font-sans text-[15px] text-ink">{post.content}</p>
      )}

      {post.images.length > 0 && (
        <div
          className={`mt-3 grid gap-1 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {post.images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="max-h-[420px] w-full rounded-[8px] object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-5 border-t border-line pt-3">
        <button
          onClick={() => toggleLike(post.id)}
          className={`flex items-center gap-1.5 font-sans text-sm ${
            post.isLiked ? "text-coral" : "text-ink/50 hover:text-coral"
          }`}
        >
          <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
          {post.likesCount}
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1.5 font-sans text-sm text-ink/50 hover:text-ink"
        >
          <MessageCircle size={18} />
          {post.commentsCount}
        </button>
      </div>

      {showComments && <CommentList postId={post.id} />}
    </div>
  );
}
