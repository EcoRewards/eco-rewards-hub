
/**
 * Standard http response with a section for linked objects
 */
export interface HttpResponse<T> {
  data: T,
  links: Record<string, object>,
  code?: number
}
