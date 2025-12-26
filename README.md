# Chzzk Activity Map

치지직(CHZZK) 스트리머의 **다시보기(VOD) 활동 기록을 1년 단위 히트맵으로 시각화**하고,  
특정 날짜를 클릭하면 해당 날짜의 다시보기 목록과 상세 정보를 확인할 수 있는 React 웹 애플리케이션입니다.

---

## ✨ 주요 기능

### 🗺️ 1년 Activity Heatmap
- 최근 **1년(365일)** 기준으로 스트리머의 다시보기 업로드 활동을 시각화
- 날짜별 다시보기 **총 방송 시간**을 기준으로 4단계 색상 표시
- 방송이 없는 날도 빈 칸으로 표시
- 주(week) 단위 hover 시 해당 주 강조 표시

### 🖱️ 날짜 클릭 → 다시보기 목록
- 히트맵 날짜 클릭 시 해당 날짜의 다시보기 목록 페이지로 이동
- 날짜별 다시보기 개수 표시
- 다시보기 카드 클릭 시 치지직 공식 다시보기 페이지로 새 탭 이동

### 🔍 채널 검색
- 스트리머 이름으로 채널 검색
- 검색 결과 상위 10명 표시
- 채널 이미지 없을 경우 Fallback 이미지 처리
- 검색 결과 없음 안내 메시지 표시

### 📺 다시보기 상세 목록 (Day Detail)
- 하루에 여러 개의 다시보기가 있을 경우 모두 표시
- 썸네일, 제목, 길이, 조회수, 카테고리, 태그 정보 제공
- 로딩 인디케이터 및 부분 실패 처리

---

## 🛠️ 기술 스택
- React (Create React App)
- React Router v6
- react-calendar-heatmap
- react-tooltip
- react-spinners
- CSS (다크모드 지원)

---

## 📂 페이지 구조
```bash
src/
├─ pages/
│   ├─ Home/           # 히트맵 메인 페이지
│   ├─ ChannelSearch/  # 채널 검색 페이지
│   └─ DayDetail/      # 날짜별 다시보기 목록
├─ components/
│   └─ Header/
├─ api/
│   └─ Chzzk.js        # 치지직 API 호출
└─ styles.css
```

## 🚀 실행 방법

```bash
npm install
npm start
```

---

## 📄 라이선스
개인 학습 및 포트폴리오 용도로 제작되었습니다.
