/**
 * =============================================
 * Step 7: DELETE 요청 처리하기
 * =============================================
 *
 * DELETE 요청으로 데이터를 삭제하는 방법을 배웁니다.
 *
 * 삭제 방식:
 *   Hard Delete - 데이터를 실제로 제거 (splice)
 *   Soft Delete - deleted 플래그만 추가 (복구 가능)
 *
 * 실행 방법: node steps/step7-delete.js
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
  { id: 4, service: 'Disney+', price: 9900, cycle: 'monthly', startDate: '2024-03-01' },
  { id: 5, service: 'ChatGPT Plus', price: 22000, cycle: 'monthly', startDate: '2024-04-01' },
];

// ─────────────────────────────────────────────
// GET - 목록 조회 (삭제된 항목 제외)
// ─────────────────────────────────────────────

app.get('/api/subscriptions', (req, res) => {
  // soft delete된 항목은 제외
  const activeSubscriptions = subscriptions.filter((sub) => !sub.deleted);

  res.json({
    success: true,
    count: activeSubscriptions.length,
    data: activeSubscriptions,
  });
});

// ─────────────────────────────────────────────
// DELETE - 단일 삭제 (Hard Delete)
// ─────────────────────────────────────────────
// 데이터를 배열에서 완전히 제거합니다

app.delete('/api/subscriptions/:id', (req, res) => {
  const id = Number(req.params.id);

  // 구독 찾기
  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '구독을 찾을 수 없습니다',
    });
  }

  // 삭제된 데이터 저장 (응답용)
  const deleted = subscriptions[index];

  // 배열에서 제거
  subscriptions.splice(index, 1);

  res.json({
    success: true,
    message: '구독이 삭제되었습니다',
    data: deleted,
  });
});

// ─────────────────────────────────────────────
// DELETE - 단일 삭제 (Soft Delete) - 별도 엔드포인트
// ─────────────────────────────────────────────
// 실제로 삭제하지 않고 deleted 플래그만 추가합니다
// 복구가 가능하고 데이터 이력을 보존할 수 있습니다

app.delete('/api/subscriptions/:id/soft', (req, res) => {
  const id = Number(req.params.id);

  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '구독을 찾을 수 없습니다',
    });
  }

  // deleted 플래그 추가 (데이터는 남아있음)
  subscriptions[index] = {
    ...subscriptions[index],
    deleted: true,
    deletedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: '구독이 삭제되었습니다 (soft delete)',
  });
});

// ─────────────────────────────────────────────
// DELETE - 여러 항목 삭제
// ─────────────────────────────────────────────

app.delete('/api/subscriptions', (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'ID 배열을 제공해주세요',
      example: { ids: [1, 2, 3] },
    });
  }

  const deletedItems = [];
  const notFoundIds = [];

  ids.forEach((id) => {
    const index = subscriptions.findIndex((sub) => sub.id === id);

    if (index !== -1) {
      deletedItems.push(subscriptions[index]);
      subscriptions.splice(index, 1);
    } else {
      notFoundIds.push(id);
    }
  });

  res.json({
    success: true,
    message: `${deletedItems.length}개 항목이 삭제되었습니다`,
    deleted: deletedItems,
    notFound: notFoundIds,
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
  console.log('  1. 삭제 전 목록 확인:');
  console.log(`     curl http://localhost:${PORT}/api/subscriptions`);
  console.log('');
  console.log('  2. 단일 삭제 (Hard Delete):');
  console.log(`     curl -X DELETE http://localhost:${PORT}/api/subscriptions/1`);
  console.log('');
  console.log('  3. 단일 삭제 (Soft Delete):');
  console.log(`     curl -X DELETE http://localhost:${PORT}/api/subscriptions/2/soft`);
  console.log('');
  console.log('  4. 여러 항목 삭제:');
  console.log(`     curl -X DELETE http://localhost:${PORT}/api/subscriptions \\`);
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"ids": [3, 4]}\'');
  console.log('');
  console.log('  5. 삭제 후 목록 확인:');
  console.log(`     curl http://localhost:${PORT}/api/subscriptions`);
});
