/**
 * =============================================
 * Step 1: Express 기초와 첫 라우트
 * =============================================
 *
 * 실행 방법: node steps/step1-basics.js
 * 테스트: 브라우저에서 http://localhost:8080 접속
 */

import express from 'express';

// Express 앱 생성
const app = express();
const PORT = 8080;

// ─────────────────────────────────────────────
// (1) 기본 라우트
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// ─────────────────────────────────────────────
// (2) 여러 라우트 만들기
// ─────────────────────────────────────────────
// 라우트 = URL 경로 + HTTP 메서드

app.get('/users', (req, res) => {
  res.send('사용자 목록');
});

app.get('/products', (req, res) => {
  res.send('상품 목록');
});

app.get('/about', (req, res) => {
  res.send('About 페이지');
});

// ─────────────────────────────────────────────
// (3) JSON 응답
// ─────────────────────────────────────────────
// API 서버는 보통 JSON 형태로 응답합니다

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  // res.json()은 자동으로 Content-Type: application/json 설정
  res.json(users);
});

// ─────────────────────────────────────────────
// (4) 상태 코드
// ─────────────────────────────────────────────
// HTTP 상태 코드로 요청의 결과를 알려줍니다
//
// 2xx - 성공
//   200 OK            - 성공
//   201 Created       - 생성 성공
//   204 No Content    - 성공 (응답 본문 없음)
//
// 4xx - 클라이언트 오류
//   400 Bad Request   - 잘못된 요청
//   401 Unauthorized  - 인증 필요
//   403 Forbidden     - 권한 없음
//   404 Not Found     - 리소스 없음
//
// 5xx - 서버 오류
//   500 Internal Server Error - 서버 오류

app.get('/success', (req, res) => {
  res.status(200).json({ message: 'Success' });
});

app.get('/created', (req, res) => {
  res.status(201).json({ message: 'Created' });
});

app.get('/error', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.get('/server-error', (req, res) => {
  res.status(500).json({ message: 'Internal Server Error' });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('테스트할 URL들:');
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/users`);
  console.log(`  http://localhost:${PORT}/products`);
  console.log(`  http://localhost:${PORT}/about`);
  console.log(`  http://localhost:${PORT}/api/users`);
  console.log(`  http://localhost:${PORT}/success`);
  console.log(`  http://localhost:${PORT}/error`);
});
