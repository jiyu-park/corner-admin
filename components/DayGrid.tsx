'use client';
import { STATUS_LABEL } from '@/lib/format';

export type GridRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  room_name: string;
  user_name: string;
  people_count: number;
};

const OPEN = 8 * 60;
const CLOSE = 22 * 60;
const SPAN = CLOSE - OPEN;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i);

/**
 * 하루의 방별 시간표. 세로는 회의실, 가로는 08~22시.
 * 예약된 시간이 색 막대로 보이고(취소는 숨김), 오늘이면 지금 시각에 세로선이 그어진다.
 */
export function DayGrid({
  rooms,
  rows,
  nowMin,
  selectedId,
  onSelect,
}: {
  rooms: string[];
  rows: GridRow[];
  nowMin: number | null; // 오늘이 아니면 null
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const names = rooms.length ? rooms : Array.from(new Set(rows.map((r) => r.room_name)));
  const live = rows.filter((r) => r.status !== 'cancelled');
  const pct = (m: number) => `${((m - OPEN) / SPAN) * 100}%`;
  const showNow = nowMin !== null && nowMin >= OPEN && nowMin <= CLOSE;

  return (
    <div className="dg-scroll">
      <div className="dg" role="table" aria-label="방별 시간표">
        <div className="dg-row dg-head" role="row">
          <div className="dg-label" role="columnheader">회의실</div>
          <div className="dg-track dg-ticks" role="columnheader">
            {HOURS.filter((h) => h % 2 === 0).map((h) => (
              <span key={h} style={{ left: pct(h * 60) }}>{String(h).padStart(2, '0')}:00</span>
            ))}
          </div>
        </div>
        {names.map((name) => (
          <div className="dg-row" role="row" key={name}>
            <div className="dg-label" role="rowheader">{name}</div>
            <div className="dg-track" role="cell">
              {showNow && <i className="dg-now" style={{ left: pct(nowMin!) }} aria-hidden="true" />}
              {live.filter((r) => r.room_name === name).map((r) => {
                const s = toMin(r.start_time);
                const e = toMin(r.end_time);
                return (
                  <button
                    type="button"
                    key={r.id}
                    className={`dg-bar st-${r.status}${selectedId === r.id ? ' sel' : ''}`}
                    style={{ left: pct(s), width: `${((e - s) / SPAN) * 100}%` }}
                    title={`${r.start_time}~${r.end_time} · ${r.user_name} · ${r.people_count}명 · ${STATUS_LABEL[r.status] ?? r.status}`}
                    aria-label={`${name} ${r.start_time}부터 ${r.end_time}까지 ${r.user_name} ${STATUS_LABEL[r.status] ?? r.status}`}
                    onClick={() => onSelect(r.id)}
                  >
                    <span className="dg-t">{r.start_time}</span>
                    <span className="dg-n">{r.user_name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="dg-legend">
        <span><i className="st-reserved" />예약됨</span>
        <span><i className="st-completed" />사용 완료</span>
        <span><i className="st-no_show" />노쇼</span>
        {nowMin !== null && <span><i className="now" />지금</span>}
        <span>막대를 누르면 아래 표에서 그 예약이 강조돼요</span>
      </div>
    </div>
  );
}
