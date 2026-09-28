import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useFeed } from "../features/feed/hooks/usePosts";
import { PostComposer } from "../features/feed/components/PostComposer";
import { PostCard } from "../features/feed/components/PostCard";

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <PostComposer />

        {isLoading && <p className="text-center font-sans text-sm text-ink/40">Đang tải...</p>}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && !isLoading && (
          <p className="py-10 text-center font-sans text-sm text-ink/40">
            Chưa có bài viết nào. Hãy follow ai đó hoặc tự đăng bài đầu tiên!
          </p>
        )}

        <div ref={ref} className="h-4">
          {isFetchingNextPage && (
            <p className="text-center font-sans text-xs text-ink/30">Đang tải thêm...</p>
          )}
        </div>
      </div>
    </div>
  );
}
