/**
 * =============================================
 * Step 5: POST 요청 처리하기
 * =============================================
 *
 * POST 요청으로 새 데이터를 생성하는 방법을 배웁니다.
 *
 * 핵심:
 * - express.json() 미들웨어로 JSON 본문 파싱
 * - req.body로 전송된 데이터 접근
 * - 데이터 검증 후 저장
 * - 201 Created 상태 코드로 응답
 *
 * 실행 방법: node steps/step5-post.js
 */

import express from 'express';

const app = express();
const PORT = 8080;

// ★ 필수! JSON 요청 본문을 파싱하는 미들웨어
// 이게 없으면 req.body가 undefined입니다
app.use(express.json());

// 임시 데이터 (let으로 선언 - 수정 가능)
let subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
];

// ─────────────────────────────────────────────
// 검증 함수
// ─────────────────────────────────────────────

function validateSubscription(data) {
  const errors = [];

  if (!data.service) errors.push('서비스 이름은 필수입니다');
  if (!data.price) errors.push('가격은 필수입니다');
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
    errors.push('가격은 양수여야 합니다');
  }

  const validCycles = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!data.cycle) {
    errors.push('구독 주기는 필수입니다');
  } else if (!validCycles.includes(data.cycle)) {
    errors.push(`구독 주기는 ${validCycles.join(', ')} 중 하나여야 합니다`);
  }

  if (!data.startDate) {
    errors.push('시작일은 필수입니다');
  } else if (isNaN(Date.parse(data.startDate))) {
    errors.push('올바른 날짜 형식이 아닙니다 (예: 2024-01-01)');
  }

  return errors;
}

// ─────────────────────────────────────────────
// GET - 전체 목록 조회
// ─────────────────────────────────────────────

app.get('/api/subscriptions', (req, res) => {
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// ─────────────────────────────────────────────
// POST - 새 구독 생성
// ─────────────────────────────────────────────

app.post('/api/subscriptions', (req, res) => {
  const { service, price, cycle, startDate } = req.body;

  // 데이터 검증
  const errors = validateSubscription(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  // 중복 검사
  const duplicate = subscriptions.find(
    (sub) => sub.service.toLowerCase() === service.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: '이미 존재하는 구독입니다',
    });
  }

  // 새 ID 생성
  const newId =
    subscriptions.length > 0
      ? Math.max(...subscriptions.map((s) => s.id)) + 1
      : 1;

  // 새 구독 생성
  const newSubscription = {
    id: newId,
    service,
    price,
    cycle,
    startDate,
    createdAt: new Date().toISOString(),
  };

  // 배열에 추가
  subscriptions.push(newSubscription);

  // 201 Created 상태로 응답
  res.status(201).json({
    success: true,
    message: '구독이 생성되었습니다',
    data: newSubscription,
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트 방법 (터미널에서 curl 사용):');
  console.log('');
  console.log('  1. 목록 조회:');
  console.log(`     curl http://localhost:${PORT}/api/subscriptions`);
  console.log('');
  console.log('  2. 새 구독 생성 (성공):');
  console.log(`     curl -X POST http://localhost:${PORT}/api/subscriptions \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"service":"Disney+","price":9900,"cycle":"monthly","startDate":"2024-03-01"}\'');
  console.log('');
  console.log('  3. 검증 실패 테스트:');
  console.log(`     curl -X POST http://localhost:${PORT}/api/subscriptions \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"service":"Test"}\'');
  console.log('');
  console.log('  4. 중복 테스트:');
  console.log(`     curl -X POST http://localhost:${PORT}/api/subscriptions \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"service":"Netflix","price":9900,"cycle":"monthly","startDate":"2024-01-01"}\'');
});
