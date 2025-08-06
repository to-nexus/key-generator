# NEXUS Key Generator

EVM 호환 키스토어 및 공유 키 생성기입니다. 일반 키스토어와 Shamir Secret Sharing을 통한 공유 키 생성을 지원합니다.

## 주요 기능

### 🔐 키 생성
- **일반 키스토어**: 표준 EVM 키스토어 생성
- **공유 키 (Shamir Secret Sharing)**: N개로 분할, K개로 복구 가능
- **Threshold 방식**: 유연한 분할/복구 설정 (예: 5개 중 3개)

### 🛡️ 보안 기능
- **강화된 비밀번호**: 특수문자, 대문자, 소문자, 숫자 필수
- **개별 암호화**: 각 공유 키마다 독립적인 비밀번호
- **복구 검증**: 공유 키 combine으로 원본 주소 일치 확인
- **직접 노출 방지**: 공유 키는 keystore 형태로만 다운로드

### 💻 사용자 경험
- **동적 UI**: 모드에 따라 필요한 입력 필드만 표시
- **실시간 검증**: 비밀번호 강도 및 일치 확인
- **핫리로드**: 개발 모드에서 실시간 코드 반영
- **크로스 플랫폼**: macOS, Windows 지원

## 사용법

### 일반 키스토어 생성
1. **총 개수**: 1로 설정
2. **비밀번호 입력**: 요구사항 충족 (8자 이상, 특수문자 포함)
3. **키 생성** 버튼 클릭
4. **결과 확인**: 키스토어, 공개키, 개인키, 주소

### 공유 키 생성
1. **총 개수**: 2-10개 설정
2. **복구 최소 개수**: 2-총 개수 사이 설정
3. **키 생성** 버튼 클릭
4. **개별 다운로드**: 각 공유 키마다 비밀번호 설정 후 다운로드

### 파일명 규칙
- **일반 키스토어**: `{주소}_keystore.json`
- **공유 키**: `{주소}_sharekey_{번호}.json`
- **기타**: `{주소}_{타입}.txt`

## 기술 스택

### Backend
- **Go**: 백엔드 언어
- **Wails**: 크로스 플랫폼 데스크톱 앱 프레임워크
- **go-ethereum**: Ethereum 암호화 라이브러리
- **hashicorp/vault/shamir**: Shamir Secret Sharing

### Frontend
- **HTML5/CSS3**: UI 구조 및 스타일링
- **Vanilla JavaScript**: 프론트엔드 로직
- **Vite**: 개발 도구 및 번들링

## 프로젝트 구조

```
key-generator/
├── app.go                 # 백엔드 로직
├── frontend/
│   ├── index.html        # 메인 UI
│   ├── src/
│   │   ├── main.js       # 프론트엔드 로직
│   │   └── style.css     # 스타일링
│   └── package.json      # 프론트엔드 의존성
├── go.mod                # Go 모듈
├── README.md             # 프로젝트 문서
├── SECURITY.md           # 보안 정책
└── .gitignore           # Git 무시 파일
```

## 개발

### 환경 설정
```bash
# Go 설치 (1.19+)
# Node.js 설치 (16+)
# Wails CLI 설치
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 개발 모드 실행
```bash
wails dev
```

### 프로덕션 빌드
```bash
wails build
```

## 보안 고려사항

- **로컬 생성**: 모든 키는 로컬에서 생성되며 외부 전송 없음
- **강화된 비밀번호**: 복잡한 비밀번호 요구사항
- **공유 키 보안**: 개별 암호화 및 직접 노출 방지
- **파일 보안**: 생성된 키 파일은 .gitignore에 포함
- **오프라인 동작**: 네트워크 연결 불필요


---

**Powered by NEXUS** • Connecting the world through blockchain
