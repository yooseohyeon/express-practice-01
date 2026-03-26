/**
 * =============================================
 * Step 6: PATCH 요청 처리하기
 * =============================================
 *
 * PATCH 요청으로 데이터를 부분 수정하는 방법을 배웁니다.
 *
 * PUT vs PATCH:
 *   PUT   - 전체 리소스 교체 (모든 필드 필요)
 *   PATCH - 일부 필드만 수정 (변경할 필드만 전송)
 *   → 실무에서는 PATCH를 더 많이 사용합니다
 *
 * 실행 방법: node steps/step6-patch.js
 */

import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.json());

// 임시 데이터
let subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium', price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
];

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
// GET - 특정 구독 조회
// ─────────────────────────────────────────────

app.get('/api/subscriptions/:id', (req, res) => {
  const id = Number(req.params.id);
  const subscription = subscriptions.find((sub) => sub.id === id);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: '구독을 찾을 수 없습니다',
    });
  }

  res.json({ success: true, data: subscription });
});

// ─────────────────────────────────────────────
// PATCH - 구독 수정
// ─────────────────────────────────────────────

app.patch('/api/subscriptions/:id', (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  // 빈 요청 확인
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: '수정할 내용이 없습니다',
    });
  }

  // 수정 가능한 필드만 허용
  const allowedFields = ['service', 'price', 'cycle', 'startDate'];
  const updateKeys = Object.keys(updates);
  const invalidFields = updateKeys.filter((key) => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `수정할 수 없는 필드입니다: ${invalidFields.join(', ')}`,
      allowedFields,
    });
  }

  // 각 필드별 검증 (PATCH는 보낸 필드만 검증)
  if (updates.price !== undefined) {
    if (typeof updates.price !== 'number' || updates.price <= 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 양수여야 합니다',
      });
    }
  }

  if (updates.cycle !== undefined) {
    const validCycles = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validCycles.includes(updates.cycle)) {
      return res.status(400).json({
        success: false,
        message: `구독 주기는 ${validCycles.join(', ')} 중 하나여야 합니다`,
      });
    }
  }

  if (updates.startDate !== undefined) {
    if (isNaN(Date.parse(updates.startDate))) {
      return res.status(400).json({
        success: false,
        message: '올바른 날짜 형식이 아닙니다',
      });
    }
  }

  // 구독 찾기
  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '구독을 찾을 수 없습니다',
    });
  }

  // 데이터 수정 (스프레드 연산자로 병합)
  subscriptions[index] = {
    ...subscriptions[index], // 기존 데이터
    ...updates,              // 새 데이터로 덮어쓰기
    id,                      // ID는 변경 불가
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: '구독이 수정되었습니다',
    data: subscriptions[index],
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트 방법:');
  console.log('');
  console.log('  1. 수정 전 확인:');
  console.log(`     curl http://localhost:${PORT}/api/subscriptions/1`);
  console.log('');
  console.log('  2. 가격만 수정:');
  console.log(`     curl -X PATCH http://localhost:${PORT}/api/subscriptions/1 \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"price": 12900}\'');
  console.log('');
  console.log('  3. 여러 필드 수정:');
  console.log(`     curl -X PATCH http://localhost:${PORT}/api/subscriptions/2 \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"price": 11900, "cycle": "yearly"}\'');
  console.log('');
  console.log('  4. 잘못된 필드 수정 시도:');
  console.log(`     curl -X PATCH http://localhost:${PORT}/api/subscriptions/1 \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"id": 999}\'');
  console.log('');
  console.log('  5. 수정 후 확인:');
  console.log(`     curl http://localhost:${PORT}/api/subscriptions`);
});
