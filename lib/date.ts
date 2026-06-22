/** "YYYY-MM-DD" をバックエンドのtime.Time(RFC3339)が受理できる形式に変換する。 */
export function toApiDate(dateOnly: string): string {
  return `${dateOnly}T00:00:00Z`;
}

/** バックエンドが返すRFC3339文字列から日付部分("YYYY-MM-DD")のみを取り出す。 */
export function fromApiDate(iso: string): string {
  return iso.slice(0, 10);
}
