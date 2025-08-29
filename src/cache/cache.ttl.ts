// FILE: src/cache/cache.ttl.ts
// Central TTLs (seconds)
export const TTL = {
  BOOK_LIST: 432000,             // 5 days → /books?sort=...
  BOOK_REVIEWS: 432000,          // 5 days → /reviews/book/:bookId?sort=...&page=&limit=
  HOT_BOOKS: 432000,             // 5 days → /books/hot
};
