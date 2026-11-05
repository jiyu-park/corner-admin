export const won = (n: number | null | undefined) => `${Number(n ?? 0).toLocaleString('ko-KR')}원`;

export function mins(n: number | null | undefined) {
  const v = Math.round(Number(n ?? 0));
  const h = Math.floor(v / 60);
  const m = v % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export const STATUS_LABEL: Record<string, string> = {
  reserved: '예약됨',
  completed: '사용 완료',
  cancelled: '취소',
  no_show: '노쇼',
};

export const ROLE_LABEL: Record<string, string> = { staff: '직원', admin: '관리자' };

export const todayKST = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
export const monthKST = () => todayKST().slice(0, 7);
export const ymd = (s: any) => (s ? String(s).slice(0, 10) : '');
