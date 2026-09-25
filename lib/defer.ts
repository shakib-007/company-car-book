export function defer(work: Promise<unknown>): void {
  void work.catch(() => undefined);
}
