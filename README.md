# NEXUS Key Generator

EVM 호환 키스토어 및 공유 키 생성기입니다. 일반 키스토어와 Shamir Secret Sharing을 통한 공유 키 생성을 지원합니다.

## 📦 릴리스

### v1.0.1 (2024-08-06)
- **개인키 노출 기능 개선**: 개인키 탭에서 일반 복사/다운로드 버튼 숨김
- **UI/UX 향상**: 개인키 노출 시 전용 버튼 표시
- **보안 강화**: 개인키 접근 제어 개선

**다운로드:**
- [macOS (Universal)](releases/v1.0.1/NEXUS-Key-Generator-v1.0.1-macOS.app)
- [Windows (x64)](releases/v1.0.1/NEXUS-Key-Generator-v1.0.1-Windows.exe)

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

#### 필수 요구사항
- **Go**: 1.19 이상
- **Node.js**: 16 이상
- **Wails CLI**: 최신 버전

#### 설치 방법

**1. Go 설치**
```bash
# macOS (Homebrew)
brew install go

# Windows (Chocolatey)
choco install golang

# Linux
sudo apt-get install golang-go
```

**2. Node.js 설치**
```bash
# macOS (Homebrew)
brew install node

# Windows (Chocolatey)
choco install nodejs

# Linux
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Wails CLI 설치**
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 개발 모드 실행

#### 기본 개발 서버 실행
```bash
# 프로젝트 루트 디렉토리에서
wails dev
```

#### 개발 옵션
```bash
# 특정 포트로 실행
wails dev -port 8080

# 개발자 도구 활성화
wails dev -devtools

# 프론트엔드만 빌드
wails dev -skipbindings

# 백엔드만 빌드
wails dev -skipfrontend
```

### 플랫폼별 빌드 방법

#### 1. 현재 플랫폼용 빌드
```bash
# 현재 OS용 실행 파일 생성
wails build

# 압축 없이 빌드
wails build -compress=false

# 디버그 정보 포함
wails build -ldflags="-s -w"
```

#### 2. macOS 빌드

**Intel Mac용**
```bash
wails build -platform darwin/amd64
```

**Apple Silicon Mac용**
```bash
wails build -platform darwin/arm64
```

**Universal Binary (Intel + Apple Silicon)**
```bash
wails build -platform darwin/universal
```

#### 3. Windows 빌드

**64비트 Windows**
```bash
wails build -platform windows/amd64
```

**32비트 Windows**
```bash
wails build -platform windows/386
```

#### 4. Linux 빌드

**64비트 Linux**
```bash
wails build -platform linux/amd64
```

**ARM64 Linux**
```bash
wails build -platform linux/arm64
```

### 빌드 옵션

#### 일반 옵션
```bash
# 프로덕션 모드 (기본값)
wails build -production

# 개발 모드
wails build -debug

# 압축 활성화
wails build -compress

# 바인딩 생성 건너뛰기
wails build -skipbindings

# 프론트엔드 빌드 건너뛰기
wails build -skipfrontend
```

#### 고급 옵션
```bash
# 커스텀 LDFlags
wails build -ldflags="-X main.version=1.0.1"

# 특정 태그로 빌드
wails build -tags="release"

# 웹뷰 로더 설정 (Windows)
wails build -tags="native_webview2loader"
```

### 배포용 빌드

#### 릴리스 빌드
```bash
# 모든 플랫폼 빌드
wails build -platform darwin/universal,windows/amd64,linux/amd64

# 압축 및 최적화
wails build -platform darwin/universal -compress -production
```

#### 배포 파일 정리
```bash
# 배포 디렉토리 생성
mkdir -p releases/v1.0.1

# macOS 앱 복사
cp -r build/bin/key-generator.app releases/v1.0.1/NEXUS-Key-Generator-v1.0.1-macOS.app

# Windows 실행 파일 복사
cp build/bin/key-generator.exe releases/v1.0.1/NEXUS-Key-Generator-v1.0.1-Windows.exe
```

### 문제 해결

#### 일반적인 문제들

**1. 빌드 실패**
```bash
# 의존성 정리
go mod tidy
go mod download

# 캐시 정리
wails build -clean
```

**2. 프론트엔드 빌드 오류**
```bash
# node_modules 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**3. 바인딩 오류**
```bash
# 바인딩 재생성
wails generate module
```

**4. Windows WebView2 문제**
```bash
# 레거시 로더 사용
wails build -tags="native_webview2loader"
```

### 개발 팁

#### 디버깅
```bash
# 개발자 도구 활성화
wails dev -devtools

# 로그 레벨 설정
wails dev -log-level debug
```

#### 성능 최적화
```bash
# 프로덕션 빌드로 성능 테스트
wails build -production
wails build/bin/key-generator
```

#### 코드 품질
```bash
# Go 코드 검사
go vet ./...

# 프론트엔드 린트 (ESLint 설치 시)
cd frontend
npm run lint
```

## 보안 고려사항

- **로컬 생성**: 모든 키는 로컬에서 생성되며 외부 전송 없음
- **강화된 비밀번호**: 복잡한 비밀번호 요구사항
- **공유 키 보안**: 개별 암호화 및 직접 노출 방지
- **파일 보안**: 생성된 키 파일은 .gitignore에 포함
- **오프라인 동작**: 네트워크 연결 불필요

## ⚖️ 면책조항

### 무료 사용
이 소프트웨어는 **무료로 사용 가능**합니다. 개인, 교육, 상업적 목적으로 자유롭게 사용하실 수 있습니다.

### 책임 면제
**중요**: 이 소프트웨어의 사용으로 인한 모든 결과에 대해 개발자는 **책임을 지지 않습니다**.

#### 포함되는 면책사항:
- **자산 손실**: 개인키 관리 부주의로 인한 암호화폐 자산 손실
- **보안 문제**: 개인키 노출, 해킹, 악성코드 등으로 인한 손해
- **기술적 오류**: 소프트웨어 버그나 예상치 못한 동작으로 인한 문제
- **데이터 손실**: 키 파일 손상, 삭제, 백업 실패 등
- **법적 문제**: 관련 법규 위반이나 규제 문제

#### 사용자 책임:
- **안전한 환경**: 안전한 환경에서만 개인키를 확인하세요
- **백업 관리**: 생성된 키 파일을 안전하게 백업하세요
- **비밀번호 보안**: 강력한 비밀번호를 사용하고 안전하게 관리하세요
- **정기 업데이트**: 최신 버전을 사용하여 보안 취약점을 방지하세요

### 권장사항
- **테스트 환경**: 실제 자산을 사용하기 전에 테스트 환경에서 충분히 검증하세요
- **소액 시작**: 처음에는 소액으로 테스트해보세요
- **보안 교육**: 암호화폐 보안에 대한 충분한 지식을 습득하세요

---

**Powered by NEXUS** • Connecting the world through blockchain
