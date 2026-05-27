export const POST_STATUS = {
  DRAFT: 1,
  REVIEW: 2,
  PUBLISHED: 3,
  REJECTED: 4,
};

export const POST_STATUS_LABELS = {
  [POST_STATUS.DRAFT]: 'Draft',
  [POST_STATUS.REVIEW]: 'In review',
  [POST_STATUS.PUBLISHED]: 'Published',
  [POST_STATUS.REJECTED]: 'Rejected',
};

export const POST_STATUS_COLORS = {
  [POST_STATUS.DRAFT]: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' },
  [POST_STATUS.REVIEW]: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
  [POST_STATUS.PUBLISHED]: { bg: 'rgba(34, 197, 94, 0.15)', color: '#86efac' },
  [POST_STATUS.REJECTED]: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' },
};

export function canEditPost(status) {
  return status === POST_STATUS.DRAFT || status === POST_STATUS.REJECTED;
}

export function canSubmitForReview(status) {
  return status === POST_STATUS.DRAFT || status === POST_STATUS.REJECTED;
}

export function canPublish(status) {
  return status === POST_STATUS.DRAFT || status === POST_STATUS.REJECTED;
}

export function canDelete(status) {
  return status !== POST_STATUS.REVIEW;
}
