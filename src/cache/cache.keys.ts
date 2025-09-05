// FILE: src/cache/cache.keys.ts

export const CacheKeys = {
  booksList: (sort: 'recent' | 'high' | 'low') => `books:${sort}`,

  bookReviewsRecent: (bookId: string, page: number, limit: number) =>
    `book:${bookId}:reviews:recent:p=${page}:l=${limit}`,

  bookReviewsPopular: (bookId: string, page: number, limit: number) =>
    `book:${bookId}:reviews:popular:p=${page}:l=${limit}`,

  hotBooks: (page: number, limit: number, category?: string) =>
    category
      ? `books:hot:cat=${category}:p=${page}:l=${limit}`
      : `books:hot:p=${page}:l=${limit}`,

  // Patterns for invalidation
  patterns: {
    bookAllReviews: (bookId: string) => `book:${bookId}:reviews:*`,
    allBooksLists: () => `books:*`,
    hotBooksAll: () => `books:hot:*`,
  },
};
