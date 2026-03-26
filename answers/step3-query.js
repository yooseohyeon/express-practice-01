/**
 * =============================================
 * Step 3: 쿼리스트링 처리하기
 * =============================================
 *
 * URL 쿼리 파라미터로 데이터를 필터링하는 방법을 배웁니다.
 *
 * 쿼리스트링 = URL의 ? 뒤에 오는 키-값 쌍
 * 예: /api/subscriptions?service=Netflix&minPrice=10000
 *
 * 실행 방법: node steps/step3-query.js
 */

import express from 'express';

const app = express();
const PORT = 8080;

// 임시 데이터
const subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium', price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
  { id: 4, service: 'Adobe CC', price: 79000, cycle: 'yearly', startDate: '2024-03-01' },
  { id: 5, service: 'GitHub Pro', price: 4000, cycle: 'monthly', startDate: '2024-03-15' },
  { id: 6, service: 'ChatGPT Plus', price: 22000, cycle: 'monthly', startDate: '2024-04-01' },
  { id: 7, service: 'Disney+', price: 9900, cycle: 'monthly', startDate: '2024-04-15' },
  { id: 8, service: 'Microsoft 365', price: 89000, cycle: 'yearly', startDate: '2024-05-01' },
];

// ─────────────────────────────────────────────
// (1) 쿼리 파라미터 읽기
// ─────────────────────────────────────────────
// req.query 객체로 접근합니다

app.get('/api/debug-query', (req, res) => {
  console.log('req.query:', req.query);

  const { service, cycle } = req.query;

  res.json({
    service,
    cycle,
    allParams: req.query,
  });
});
// 테스트: http://localhost:8080/api/debug-query?service=Netflix&cycle=monthly

// ─────────────────────────────────────────────
// (2) 필터링 + 정렬 + 페이지네이션 통합
// ─────────────────────────────────────────────

app.get('/api/subscriptions', (req, res) => {
  const { service, cycle, minPrice, maxPrice, sort, order = 'asc', page, limit } = req.query;

  let results = [...subscriptions];

  // ── 필터링 ──

  // 서비스 이름 필터 (부분 일치)
  if (service) {
    results = results.filter((sub) =>
      sub.service.toLowerCase().includes(service.toLowerCase())
    );
  }

  // 구독 주기 필터 (정확히 일치)
  if (cycle) {
    results = results.filter((sub) => sub.cycle === cycle);
  }

  // 최소 가격 필터
  if (minPrice) {
    results = results.filter((sub) => sub.price >= Number(minPrice));
  }

  // 최대 가격 필터
  if (maxPrice) {
    results = results.filter((sub) => sub.price <= Number(maxPrice));
  }

  // ── 정렬 ──

  if (sort) {
    results.sort((a, b) => {
      let valueA = a[sort];
      let valueB = b[sort];

      // 문자열인 경우 소문자로 변환
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (order === 'desc') {
        return valueA > valueB ? -1 : 1;
      } else {
        return valueA > valueB ? 1 : -1;
      }
    });
  }

  // ── 페이지네이션 ──

  const total = results.length;

  if (page || limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    results = results.slice(startIndex, endIndex);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: results,
    });
  }

  // ── 응답 ──

  res.json({
    success: true,
    count: results.length,
    filters: { service, cycle, minPrice, maxPrice },
    data: results,
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트할 URL들:');
  console.log('');
  console.log('  쿼리 파라미터 확인:');
  console.log(`  http://localhost:${PORT}/api/debug-query?service=Netflix&cycle=monthly`);
  console.log('');
  console.log('  필터링:');
  console.log(`  http://localhost:${PORT}/api/subscriptions?service=netflix`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?cycle=monthly`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?minPrice=10000&maxPrice=20000`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?cycle=monthly&minPrice=10000`);
  console.log('');
  console.log('  정렬:');
  console.log(`  http://localhost:${PORT}/api/subscriptions?sort=price&order=asc`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?sort=price&order=desc`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?sort=service`);
  console.log('');
  console.log('  페이지네이션:');
  console.log(`  http://localhost:${PORT}/api/subscriptions?page=1&limit=3`);
  console.log(`  http://localhost:${PORT}/api/subscriptions?page=2&limit=3`);
  console.log('');
  console.log('  조합:');
  console.log(`  http://localhost:${PORT}/api/subscriptions?cycle=monthly&sort=price&order=desc&page=1&limit=3`);
});
