import { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost, deletePost, approvePost, createComment, updatePost } from '../api/posts';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PostCard } from '../components/post/PostCard';
import { PostForm } from '../components/post/PostForm';
import type { Post, PostCreateRequest, CommentCreateRequest } from '../types/post';

export function PostListPage() {
  const { isAdmin, isMember, isGuest, nickname } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = isGuest ? await getPosts('approved') : await getPosts();
      setPosts(data);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (data: PostCreateRequest) => {
    try {
      await createPost({ ...data, author: nickname || '익명' });
      showToast('게시글이 등록되었습니다', 'success');
      setShowForm(false);
      loadData();
    } catch (err) {
      showToast('게시글 등록에 실패했습니다', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePost(id);
      showToast('게시글이 삭제되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('삭제에 실패했습니다', 'error');
    }
  };

  const handleApprove = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await approvePost(id, status);
      const statusMessage = status === 'approved'
        ? '승인되었습니다'
        : status === 'rejected'
          ? '거절되었습니다'
          : '승인이 취소되었습니다';
      showToast(statusMessage, 'success');
      loadData();
    } catch (err) {
      showToast('처리에 실패했습니다', 'error');
    }
  };

  const handleComment = async (postId: string, data: CommentCreateRequest) => {
    try {
      await createComment(postId, { ...data, author: nickname || '익명' });
      showToast('댓글이 등록되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('댓글 등록에 실패했습니다', 'error');
    }
  };

  const handleUpdate = async (id: string, data: { title: string; content: string }) => {
    try {
      await updatePost(id, data);
      showToast('게시글이 수정되었습니다', 'success');
      loadData();
    } catch {
      showToast('게시글 수정에 실패했습니다', 'error');
    }
  };

  const canCreate = isAdmin || isMember;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-sans font-bold text-text">탐방 게시판</h2>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
          >
            {showForm ? '취소' : '+ 글쓰기'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <PostForm onSubmit={handleCreate} />
        </div>
      )}

      {loading ? (
        <p className="text-center text-text-muted py-8">로딩 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-text-muted py-8">게시글이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              onDelete={isAdmin ? handleDelete : undefined}
              onApprove={isAdmin ? handleApprove : undefined}
              onUpdate={handleUpdate}
              onComment={!isGuest ? handleComment : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
