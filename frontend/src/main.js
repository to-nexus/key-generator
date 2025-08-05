import './style.css'

// Wails API 가져오기
import { GenerateKey, GenerateShamirShares, OpenDownloadFolder, GetDownloadPath, SaveFileToDownloads } from '../wailsjs/go/main/App'

// DOM 요소들
const passwordInput = document.getElementById('password')
const confirmPasswordInput = document.getElementById('confirmPassword')
const passwordMatchElement = document.getElementById('passwordMatch')
const shareCountInput = document.getElementById('shareCount')
const generateBtn = document.getElementById('generateBtn')
const resultsSection = document.getElementById('resultsSection')
const sharesTab = document.getElementById('sharesTab')

// 탭 관련 요소들
const tabBtns = document.querySelectorAll('.tab-btn')
const tabPanes = document.querySelectorAll('.tab-pane')

// 결과 내용 요소들
const keystoreContent = document.getElementById('keystoreContent')
const publicKeyContent = document.getElementById('publicKeyContent')
const privateKeyContent = document.getElementById('privateKeyContent')
const addressContent = document.getElementById('addressContent')
const sharesContent = document.getElementById('sharesContent')

// 액션 버튼들
const copyBtn = document.getElementById('copyBtn')
const downloadBtn = document.getElementById('downloadBtn')

// 현재 활성 탭과 결과 데이터
let currentTab = 'keystore'
let currentResult = null

// 이벤트 리스너들
generateBtn.addEventListener('click', handleGenerate)
copyBtn.addEventListener('click', handleCopy)
downloadBtn.addEventListener('click', handleDownload)

// 비밀번호 확인 이벤트 리스너
passwordInput.addEventListener('input', checkPasswordMatch)
confirmPasswordInput.addEventListener('input', checkPasswordMatch)

// 탭 버튼 이벤트 리스너
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab
        switchTab(tabName)
    })
})

// 비밀번호 강도 검증
function validatePasswordStrength(password) {
    const errors = []
    
    if (password.length < 8) {
        errors.push('최소 8자 이상이어야 합니다')
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('대문자 1개 이상이 필요합니다')
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('소문자 1개 이상이 필요합니다')
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('숫자 1개 이상이 필요합니다')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('특수문자 1개 이상이 필요합니다')
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    }
}

// 비밀번호 일치 확인
function checkPasswordMatch() {
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    
    // 비밀번호 입력 필드 스타일 초기화
    passwordInput.classList.remove('error', 'success')
    confirmPasswordInput.classList.remove('error', 'success')
    passwordMatchElement.classList.remove('match', 'mismatch')
    passwordMatchElement.textContent = ''
    
    // 두 필드가 모두 비어있으면 아무것도 표시하지 않음
    if (!password && !confirmPassword) {
        generateBtn.disabled = true
        return
    }
    
    // 비밀번호 강도 검증
    const strengthValidation = validatePasswordStrength(password)
    
    // 비밀번호가 비어있으면 확인 필드에 에러 표시
    if (!password) {
        confirmPasswordInput.classList.add('error')
        passwordMatchElement.textContent = '비밀번호를 먼저 입력하세요'
        passwordMatchElement.classList.add('mismatch')
        generateBtn.disabled = true
        return
    }
    
    // 비밀번호 강도가 부족하면 에러 표시
    if (!strengthValidation.isValid) {
        passwordInput.classList.add('error')
        passwordMatchElement.textContent = `비밀번호 요구사항: ${strengthValidation.errors.join(', ')}`
        passwordMatchElement.classList.add('mismatch')
        generateBtn.disabled = true
        return
    }
    
    // 확인 비밀번호가 비어있으면
    if (!confirmPassword) {
        passwordInput.classList.add('success')
        passwordMatchElement.textContent = '비밀번호 확인을 입력하세요'
        generateBtn.disabled = true
        return
    }
    
    // 비밀번호 일치 확인
    if (password === confirmPassword) {
        passwordInput.classList.add('success')
        confirmPasswordInput.classList.add('success')
        passwordMatchElement.textContent = '✓ 비밀번호가 일치합니다'
        passwordMatchElement.classList.add('match')
        generateBtn.disabled = false
    } else {
        passwordInput.classList.add('error')
        confirmPasswordInput.classList.add('error')
        passwordMatchElement.textContent = '✗ 비밀번호가 일치하지 않습니다'
        passwordMatchElement.classList.add('mismatch')
        generateBtn.disabled = true
    }
}

// 키 생성 처리
async function handleGenerate() {
    const password = passwordInput.value.trim()
    const confirmPassword = confirmPasswordInput.value.trim()
    const shareCount = parseInt(shareCountInput.value)

    if (!password) {
        alert('비밀번호를 입력해주세요.')
        return
    }

    // 비밀번호 강도 재검증
    const strengthValidation = validatePasswordStrength(password)
    if (!strengthValidation.isValid) {
        alert(`비밀번호가 요구사항을 충족하지 않습니다:\n${strengthValidation.errors.join('\n')}`)
        return
    }

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.')
        return
    }

    if (shareCount < 1 || shareCount > 10) {
        alert('샤미르 쉐어 개수는 1-10 사이여야 합니다.')
        return
    }

    try {
        generateBtn.disabled = true
        generateBtn.textContent = '생성 중...'

        let result
        if (shareCount === 1) {
            // 일반 키 생성
            result = await GenerateKey(password)
            sharesTab.style.display = 'none'
        } else {
            // 샤미르 쉐어 생성
            result = await GenerateShamirShares(password, shareCount)
            sharesTab.style.display = 'block'
        }

        displayResults(result, shareCount > 1)
        
    } catch (error) {
        console.error('키 생성 오류:', error)
        alert('키 생성 중 오류가 발생했습니다: ' + error.message)
    } finally {
        generateBtn.disabled = false
        generateBtn.textContent = '키 생성'
        // 비밀번호 확인 상태를 다시 체크
        checkPasswordMatch()
    }
}

// 결과 표시
function displayResults(result, isShamir = false) {
    currentResult = result
    
    // 기본 정보 표시
    keystoreContent.textContent = result.keystore
    publicKeyContent.textContent = result.publicKey
    privateKeyContent.textContent = result.privateKey
    addressContent.textContent = result.address

    // 샤미르 쉐어 표시
    if (isShamir && result.shares) {
        sharesContent.innerHTML = ''
        result.shares.forEach((share, index) => {
            const shareDiv = document.createElement('div')
            shareDiv.className = 'share-item'
            shareDiv.innerHTML = `<strong>Share ${index + 1}:</strong> ${share}`
            sharesContent.appendChild(shareDiv)
        })
    }

    // 결과 섹션 표시
    resultsSection.style.display = 'block'
    
    // 첫 번째 탭으로 스크롤
    resultsSection.scrollIntoView({ behavior: 'smooth' })
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    tabBtns.forEach(btn => btn.classList.remove('active'))
    
    // 모든 탭 패널 숨기기
    tabPanes.forEach(pane => pane.classList.remove('active'))
    
    // 선택된 탭 활성화
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`)
    const selectedPane = document.getElementById(tabName)
    
    if (selectedBtn && selectedPane) {
        selectedBtn.classList.add('active')
        selectedPane.classList.add('active')
        currentTab = tabName
    }
}

// 복사 기능
async function handleCopy() {
    if (!currentResult) return

    let textToCopy = ''
    
    switch (currentTab) {
        case 'keystore':
            textToCopy = currentResult.keystore
            break
        case 'publicKey':
            textToCopy = currentResult.publicKey
            break
        case 'privateKey':
            textToCopy = currentResult.privateKey
            break
        case 'address':
            textToCopy = currentResult.address
            break
        case 'shares':
            if (currentResult.shares) {
                textToCopy = currentResult.shares.join('\n')
            }
            break
    }

    try {
        await navigator.clipboard.writeText(textToCopy)
        showNotification('클립보드에 복사되었습니다!')
    } catch (error) {
        console.error('복사 실패:', error)
        alert('복사에 실패했습니다.')
    }
}

// 다운로드 기능
function handleDownload() {
    if (!currentResult) return

    let content = ''
    let filename = ''

    // 지갑 주소에서 0x 제거
    const addressWithoutPrefix = currentResult.address.replace('0x', '')

    switch (currentTab) {
        case 'keystore':
            content = currentResult.keystore
            filename = `${addressWithoutPrefix}_keystore.json`
            break
        case 'publicKey':
            content = currentResult.publicKey
            filename = `${addressWithoutPrefix}_public_key.txt`
            break
        case 'privateKey':
            content = currentResult.privateKey
            filename = `${addressWithoutPrefix}_private_key.txt`
            break
        case 'address':
            content = currentResult.address
            filename = `${addressWithoutPrefix}_address.txt`
            break
        case 'shares':
            if (currentResult.shares) {
                content = currentResult.shares.join('\n')
                filename = `${addressWithoutPrefix}_shamir_shares.txt`
            }
            break
    }

    if (content && filename) {
        downloadFile(content, filename)
    }
}

// 파일 다운로드
async function downloadFile(content, filename) {
    try {
        console.log('다운로드 시작:', filename)
        console.log('콘텐츠 길이:', content.length)
        
        // 백엔드에서 파일 저장
        await SaveFileToDownloads(filename, content)
        
        console.log('파일 저장 완료')
        
        // 다운로드 경로 가져오기
        try {
            const downloadPath = await GetDownloadPath()
            console.log('다운로드 경로:', downloadPath)
            showNotification(`파일이 다운로드되었습니다!\n경로: ${downloadPath}/${filename}`)
        } catch (error) {
            console.error('다운로드 경로 가져오기 실패:', error)
            showNotification(`파일이 다운로드되었습니다!\n파일명: ${filename}`)
        }
        
        // 다운로드 완료 후 탐색기 열기
        setTimeout(async () => {
            try {
                console.log('탐색기 열기 시도')
                await OpenDownloadFolder()
                console.log('탐색기 열기 성공')
            } catch (error) {
                console.error('탐색기 열기 실패:', error)
            }
        }, 1000)
        
    } catch (error) {
        console.error('다운로드 오류:', error)
        showNotification(`다운로드 실패: ${error.message}`)
    }
}

// 알림 표시
function showNotification(message) {
    const notification = document.createElement('div')
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 600;
        white-space: pre-line;
        max-width: 400px;
    `
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.remove()
    }, 5000)
}

// 엔터 키로 키 생성
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmPasswordInput.focus()
    }
})

confirmPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!generateBtn.disabled) {
            handleGenerate()
        }
    }
})

shareCountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!generateBtn.disabled) {
            handleGenerate()
        }
    }
})
