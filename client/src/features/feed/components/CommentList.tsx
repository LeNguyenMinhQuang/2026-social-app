import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // 1. Import plugin
import "dayjs/locale/vi"; // (Tùy chọn) Import tiếng Việt nếu muốn hiển thị "X phút trước"
import { Trash2 } from "lucide-react";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/useComments";
import { useAuthStore } from "../../auth/store/authStore";
import { Button } from "../../../components/common/Button";

interface CommentListProps {
  postId: string;
}

dayjs.extend(relativeTime); // 2. Kích hoạt plugin cho dayjs
dayjs.locale("vi"); // (Tùy chọn) Chuyển ngôn ngữ sang tiếng Việt

export function CommentList({ postId }: CommentListProps) {
  const [content, setContent] = useState("");
  const currentUser = useAuthStore((state) => state.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(postId, true);
  const { mutate: createComment, isPending } = useCreateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

  const handleSubmit = () => {
    if (!content.trim()) return;
    createComment(content, { onSuccess: () => setContent("") });
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Viết bình luận..."
          className="flex-1 border-0 border-b border-line bg-transparent py-1.5 font-sans text-sm text-ink outline-none placeholder:text-ink/30 focus:border-coral"
        />
        <Button className="w-auto px-4 py-1.5 text-sm" isLoading={isPending} onClick={handleSubmit}>
          Gửi
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {comments.map((comment) => (
          <div key={comment._id} className="flex items-start justify-between gap-2">
            <div className="flex gap-2.5">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-line">
                {comment.author.avatar && (
                  <img src={comment.author.avatar} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-ink">
                  {comment.author.username}
                  <span className="ml-2 font-normal text-ink/40">
                    {dayjs(comment.createdAt).fromNow()}
                  </span>
                </p>
                <p className="mt-0.5 font-sans text-sm text-ink/80">{comment.content}</p>
              </div>
            </div>

            {currentUser?.id === comment.author._id && (
              <button
                onClick={() => deleteComment(comment._id)}
                className="shrink-0 text-ink/20 hover:text-coral"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-3 font-sans text-xs text-ink/40 hover:text-coral"
        >
          {isFetchingNextPage ? "Đang tải..." : "Xem thêm bình luận"}
        </button>
      )}
    </div>
  );
}
