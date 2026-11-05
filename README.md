# corner-admin

공유 오피스 "모퉁이"의 어드민(직원·관리자용)입니다. 예약 현황, 노쇼 전환, 멤버·청구, 고정석 배정, 직원 계정 관리를 합니다.

- Next.js (App Router) + TypeScript
- 백엔드: `corner-backend` (NestJS). 이 앱은 DB에 직접 접근하지 않고 백엔드 API만 부릅니다.

## 실행

```bash
cp .env.example .env.local   # 백엔드 주소를 적는다
npm install
npm run dev                  # http://localhost:3102
```

## 설정값

| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 (예: Render 주소). 브라우저에서 쓰는 값이라 비밀값을 넣지 않는다 |

## 배포 (Vercel)

1. Vercel에서 이 저장소를 Import 한다. (Framework: Next.js, 기본 설정 그대로)
2. Environment Variables에 `NEXT_PUBLIC_API_URL` 을 배포된 백엔드 주소로 넣는다.
3. 배포된 주소를 백엔드의 `FRONTEND_URL`에 추가한다. (CORS)

## 화면

| 경로 | 내용 | 권한 |
|---|---|---|
| `/login`, `/change-password` | 로그인, 임시 비밀번호를 새 비밀번호로 변경 | 직원·관리자 |
| `/` | 예약 현황, 사용 시작·완료, 노쇼 전환, 정정 | 직원·관리자 |
| `/members` | 멤버·청구, 회사 만들기, 멤버십 추가·해지, 소속 추가, 퇴사 처리 | 직원·관리자 |
| `/seats` | 고정석 배정 | 직원·관리자 |
| `/reports` | 이번 달 종료 멤버, 회의실 이용률 | 직원·관리자 |
| `/staff` | 직원 계정 만들기·수정·사용 중지·비밀번호 리셋 | 관리자만 |

서버가 규칙을 거절하면 "DB가 거절했어요" 또는 "백엔드가 거절했어요" 배지와 함께 이유를 보여 줍니다.
모든 데이터는 가상입니다.
