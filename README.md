# NEXUS Key Generator

Wails를 사용하여 만든 Go 풀스택 데스크톱 애플리케이션으로, EVM(Ethereum Virtual Machine) 호환 지갑 키를 생성하는 도구입니다.

## 주요 기능

- **일반 키스토어 생성**: 단일 키스토어 파일 생성
- **샤미르 쉐어 생성**: 다중 파티 키 분할을 위한 Shamir Secret Sharing
- **다양한 출력 형식**: 키스토어, 공개키, 개인키, 주소 제공
- **복사 및 다운로드**: 생성된 키 정보를 클립보드에 복사하거나 파일로 다운로드
- **모던 UI**: 직관적이고 아름다운 사용자 인터페이스
- **강화된 보안**: 특수문자, 대문자, 소문자, 숫자 포함 비밀번호 요구사항

## 사용법

### 1. 비밀번호 입력
키스토어를 암호화할 비밀번호를 입력합니다.

**비밀번호 요구사항:**
- 최소 8자 이상
- 대문자 1개 이상
- 소문자 1개 이상
- 숫자 1개 이상
- 특수문자 1개 이상 (!@#$%^&* 등)

### 2. 샤미르 쉐어 개수 설정
- **1**: 일반 키스토어 생성
- **2 이상**: 샤미르 쉐어 생성 (예: 3개 쉐어 중 3개 모두 필요)

### 3. 키 생성
"키 생성" 버튼을 클릭하여 키를 생성합니다.

### 4. 결과 확인
생성된 키 정보를 다음 탭에서 확인할 수 있습니다:
- **키스토어**: JSON 형식의 키스토어 파일
- **공개키**: 16진수 형식의 공개키
- **개인키**: 16진수 형식의 개인키 (주의: 안전하게 보관하세요)
- **주소**: EVM 호환 주소
- **샤미르 쉐어**: 분할된 키 쉐어들 (2개 이상 선택 시)

### 5. 파일 다운로드
- 파일명 형식: `{지갑주소(0x제거)}_{탭정보}.확장자`
- 예시: `a1b2c3d4e5f6_keystore.json`
- 다운로드 완료 후 자동으로 탐색기(파인더) 열림

## 개발 환경 설정

### 필수 요구사항
- Go 1.24.3 이상
- Node.js 18 이상
- Wails CLI

### 설치 및 실행

1. **의존성 설치**
```bash
go mod tidy
cd frontend && npm install
```

2. **개발 모드 실행**
```bash
wails dev
```

3. **프로덕션 빌드**
```bash
wails build
```

## 프로젝트 구조

```
key-generator/
├── app.go              # 백엔드 로직 (Go)
├── main.go             # 애플리케이션 진입점
├── frontend/           # 프론트엔드 (Vanilla JS)
│   ├── index.html      # 메인 HTML
│   ├── src/
│   │   ├── main.js     # JavaScript 로직
│   │   └── style.css   # 스타일시트
│   └── package.json
├── build/              # 빌드된 실행 파일
├── go.mod              # Go 의존성
├── go.sum              # Go 의존성 체크섬
├── wails.json          # Wails 설정
├── .gitignore          # Git 무시 파일
├── README.md           # 프로젝트 설명
└── SECURITY.md         # 보안 정책
```

## 기술 스택

### 백엔드 (Go)
- **Wails v2**: 데스크톱 애플리케이션 프레임워크
- **go-ethereum**: EVM 키 생성 및 암호화
- **hashicorp/vault/shamir**: Shamir Secret Sharing

### 프론트엔드 (Vanilla JS)
- **HTML5/CSS3**: 모던 UI 구현
- **JavaScript ES6+**: 비동기 처리 및 DOM 조작
- **Wails API**: 백엔드와의 통신

## 보안 고려사항

- 개인키는 로컬에서만 생성되며 외부로 전송되지 않습니다
- 샤미르 쉐어는 안전한 방법으로 분할됩니다
- 키스토어는 표준 형식으로 암호화됩니다
- 강화된 비밀번호 요구사항으로 보안 강화
- 생성된 키 파일은 자동으로 .gitignore에 포함됩니다

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 지원

문제가 있거나 기능 요청이 있으시면 GitHub Issues를 통해 문의해주세요.

## 보안 취약점 신고

보안 취약점을 발견하셨다면 [SECURITY.md](SECURITY.md)를 참고하여 신고해주세요.
