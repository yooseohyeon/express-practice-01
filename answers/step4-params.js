/**
 * =============================================
 * Step 4: URL 파라미터 처리하기
 * =============================================
 *
 * 동적 URL로 특정 데이터를 조회하는 방법을 배웁니다.
 *
 * 쿼리스트링 vs URL 파라미터:
 *   쿼리스트링:   /api/subscriptions?id=1     → 필터링, 옵션 (선택)
 *   URL 파라미터: /api/subscriptions/1        → 리소스 식별 (필수)
 *
 * 실행 방법: node steps/step4-params.js
 */

import express from 'express';

const app = express();
const PORT = 8080;

// 임시 데이터
const subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium', price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
];

// ─────────────────────────────────────────────
// (1) 전체 목록 조회
// ─────────────────────────────────────────────

app.get('/api/subscriptions', (req, res) => {
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// ─────────────────────────────────────────────
// (2) 특정 구독 조회 (URL 파라미터)
// ─────────────────────────────────────────────
// :id 부분이 URL 파라미터
// req.params.id로 접근 (항상 문자열)

app.get('/api/subscriptions/:id', (req, res) => {
  const id = req.params.id;

  // 숫자 검증
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID는 숫자여야 합니다',
    });
  }

  const numId = Number(id);

  // 양수 검증
  if (numId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID는 양수여야 합니다',
    });
  }

  // 구독 찾기
  const subscription = subscriptions.find((sub) => sub.id === numId);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: `ID ${numId}인 구독을 찾을 수 없습니다`,
    });
  }

  res.json({
    success: true,
    data: subscription,
  });
});

// ─────────────────────────────────────────────
// (3) 여러 파라미터
// ─────────────────────────────────────────────

app.get('/api/users/:userId/subscriptions/:subId', (req, res) => {
  const { userId, subId } = req.params;

  res.json({
    userId: Number(userId),
    subscriptionId: Number(subId),
    message: `유저 ${userId}의 구독 ${subId}번 조회`,
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트할 URL들:');
  console.log(`  http://localhost:${PORT}/api/subscriptions        → 전체 목록`);
  console.log(`  http://localhost:${PORT}/api/subscriptions/1      → Netflix 조회`);
  console.log(`  http://localhost:${PORT}/api/subscriptions/2      → YouTube 조회`);
  console.log(`  http://localhost:${PORT}/api/subscriptions/999    → 404 에러`);
  console.log(`  http://localhost:${PORT}/api/subscriptions/abc    → 400 에러`);
  console.log(`  http://localhost:${PORT}/api/subscriptions/-1     → 400 에러`);
  console.log(`  http://localhost:${PORT}/api/users/10/subscriptions/5 → 여러 파라미터`);
});
