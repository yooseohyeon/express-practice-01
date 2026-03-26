/**
 * =============================================
 * Step 2: GET 요청 처리하기
 * =============================================
 *
 * GET 요청으로 데이터를 조회하는 방법을 배웁니다.
 *
 * 실행 방법: node steps/step2-get.js
 * 테스트: http://localhost:8080/api/subscriptions
 */

import express from 'express';

const app = express();
const PORT = 8080;

// ─────────────────────────────────────────────
// 임시 데이터 (메모리 DB 역할)
// ─────────────────────────────────────────────
// 실제 서비스에서는 데이터베이스를 사용하지만,
// 지금은 배열을 사용해서 데이터를 저장합니다.
// 서버를 재시작하면 데이터가 초기화됩니다.

const subscriptions = [
  {
    id: 1,
    service: 'Netflix',
    price: 9900,
    cycle: 'monthly',
    startDate: '2024-01-01',
  },
  {
    id: 2,
    service: 'YouTube Premium',
    price: 14900,
    cycle: 'monthly',
    startDate: '2024-01-15',
  },
  {
    id: 3,
    service: 'Spotify',
    price: 10900,
    cycle: 'monthly',
    startDate: '2024-02-01',
  },
];

// ─────────────────────────────────────────────
// (1) 전체 목록 조회 - 배열 응답
// ─────────────────────────────────────────────
// 가장 기본적인 형태: 배열을 그대로 반환

// app.get('/api/subscriptions', (req, res) => {
//   res.json(subscriptions);
// });

// ─────────────────────────────────────────────
// (2) 전체 목록 조회 - 객체 응답 (권장)
// ─────────────────────────────────────────────
// 메타 정보를 함께 보내면 프론트엔드에서 사용하기 편합니다

app.get('/api/subscriptions', (req, res) => {
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// ─────────────────────────────────────────────
// (3) 에러 처리가 포함된 조회
// ─────────────────────────────────────────────

app.get('/api/subscriptions-safe', (req, res) => {
  try {
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '구독 내역이 없습니다',
      });
    }

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트할 URL들:');
  console.log(`  http://localhost:${PORT}/api/subscriptions`);
  console.log(`  http://localhost:${PORT}/api/subscriptions-safe`);
  console.log('');
  console.log('curl 테스트:');
  console.log(`  curl http://localhost:${PORT}/api/subscriptions`);
});
