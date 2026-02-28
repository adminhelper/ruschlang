import type { PostComment, CommentNode } from '../types/post';

export function buildCommentTree(comments: PostComment[]): CommentNode[] {
  const nodeMap = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    nodeMap.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodeMap.get(comment.id)!;
    if (!comment.parentCommentId) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(comment.parentCommentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}
