'use client';
import { ApiError } from '@/lib/api';

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const e = error as ApiError;
  const source = e.source;
  return (
    <div className={`errbox src-${source ?? 'unknown'}`} role="alert">
      <div className="errhead">
        {source === 'db' && <span className="badge db">DB가 거절했어요</span>}
        {source === 'backend' && <span className="badge be">백엔드가 거절했어요</span>}
        {source === 'network' && <span className="badge net">연결 오류</span>}
        {e.statusCode ? <span className="http">HTTP {e.statusCode}</span> : null}
      </div>
      <div className="errmsg">{e.message || String(error)}</div>
      {e.db_constraint ? <div className="errconstraint">제약 조건: {e.db_constraint}</div> : null}
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <div className="notice">{children}</div>;
}
