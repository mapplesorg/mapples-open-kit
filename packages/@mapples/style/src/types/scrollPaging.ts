/** Where a paging scroll view stands. */
export interface ScrollPagingState {
  /** Zero-based index of the page in view. */
  page: number;
  /** How many pages the content holds; `0` until the scroll view has measured. */
  count: number;
}
