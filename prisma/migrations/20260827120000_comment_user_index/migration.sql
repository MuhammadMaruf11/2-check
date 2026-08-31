-- Comment.userId is filtered directly by the "My Comments" (user) and
-- moderation queries; it had no index despite blogId already having one.
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
