import './style.css'

// Wails API 가져오기
import { GenerateKey, GenerateShamirShares, CreateShareKeystore, CombineShamirShares, OpenDownloadFolder, GetDownloadPath, SaveFileToDownloads } from '../wailsjs/go/main/App'

// DOM 요소들
const passwordInput = document.getElementById('password')
const confirmPasswordInput = document.getElementById('confirmPassword')
const passwordMatchElement = document.getElementById('passwordMatch')
const totalSharesInput = document.getElementById('totalShares')
const thresholdInput = document.getElementById('threshold')
const generateBtn = document.getElementById('generateBtn')
const resultsSection = document.getElementById('resultsSection')
const sharesTab = document.getElementById('sharesTab')

// Share key 관련 요소들
const shareListElement = document.getElementById('shareList')
const recoveredAddressElement = document.getElementById('recoveredAddress')

// 개인키 관련 요소들
const revealPrivateKeyBtn = document.getElementById('revealPrivateKeyBtn')
const privateKeyText = document.getElementById('privateKeyText')
const copyPrivateKeyBtn = document.getElementById('copyPrivateKeyBtn')
const downloadPrivateKeyBtn = document.getElementById('downloadPrivateKeyBtn')

// 탭 관련 요소들
const tabBtns = document.querySelectorAll('.tab-btn')
const tabPanes = document.querySelectorAll('.tab-pane')

// 결과 내용 요소들
const keystoreContent = document.getElementById('keystoreContent')
const publicKeyContent = document.getElementById('publicKeyContent')
const privateKeyContent = document.getElementById('privateKeyContent')
const addressContent = document.getElementById('addressContent')

// 액션 버튼들
const copyBtn = document.getElementById('copyBtn')
const downloadBtn = document.getElementById('downloadBtn')

// 현재 활성 탭과 결과 데이터
let currentTab = 'keystore'
let currentResult = null
let privateKeyRevealed = false

// 이벤트 리스너들
generateBtn.addEventListener('click', handleGenerate)
copyBtn.addEventListener('click', handleCopy)
downloadBtn.addEventListener('click', handleDownload)

// 개인키 관련 이벤트 리스너
revealPrivateKeyBtn.addEventListener('click', handleRevealPrivateKey)
copyPrivateKeyBtn.addEventListener('click', handleCopyPrivateKey)
downloadPrivateKeyBtn.addEventListener('click', handleDownloadPrivateKey)

// 비밀번호 확인 이벤트 리스너
passwordInput.addEventListener('input', checkPasswordMatch)
confirmPasswordInput.addEventListener('input', checkPasswordMatch)

// 공유 키 설정 변경 이벤트 리스너
totalSharesInput.addEventListener('input', updateUIForShareCount)
thresholdInput.addEventListener('input', updateUIForShareCount)

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
    const totalShares = parseInt(totalSharesInput.value) || 1
    
    // 공유 키 모드일 때는 키 생성 버튼 활성화
    if (totalShares >= 2) {
        generateBtn.disabled = false
        return
    }
    
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
    const totalShares = parseInt(totalSharesInput.value)
    const threshold = parseInt(thresholdInput.value)
    
    console.log('키 생성 시작:', { totalShares, threshold })
    
    // 총 개수가 1일 때 (일반 키스토어)
    if (totalShares === 1) {
        console.log('일반 키스토어 모드')
        const password = passwordInput.value.trim()
        const confirmPassword = confirmPasswordInput.value.trim()

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

        try {
            generateBtn.disabled = true
            generateBtn.textContent = '생성 중...'

            // 일반 키 생성
            const result = await GenerateKey(password)
            sharesTab.style.display = 'none'
            displayResults(result, false)
            
        } catch (error) {
            console.error('키 생성 오류:', error)
            alert('키 생성 중 오류가 발생했습니다: ' + error.message)
        } finally {
            generateBtn.disabled = false
            generateBtn.textContent = '키 생성'
            checkPasswordMatch()
        }
        
    } else {
        console.log('공유 키 모드')
        // 공유 키 모드 - 비밀번호 검증 없이 바로 생성
        if (totalShares < 2 || totalShares > 10) {
            alert('총 공유 키 개수는 2-10 사이여야 합니다.')
            return
        }

        if (threshold < 2 || threshold > totalShares) {
            alert('복구에 필요한 최소 개수는 2-총 개수 사이여야 합니다.')
            return
        }

        try {
            console.log('공유 키 생성 시작')
            generateBtn.disabled = true
            generateBtn.textContent = '생성 중...'

            // 공유 키 생성 (임시 비밀번호 사용)
            const result = await GenerateShamirShares("temp_password", totalShares, threshold)
            console.log('공유 키 생성 완료:', result)
            sharesTab.style.display = 'block'
            displayResults(result, true)
            
        } catch (error) {
            console.error('공유 키 생성 오류:', error)
            alert('공유 키 생성 중 오류가 발생했습니다: ' + error.message)
        } finally {
            generateBtn.disabled = false
            generateBtn.textContent = '키 생성'
        }
    }
}

// 결과 표시
function displayResults(result, isShamir = false) {
    currentResult = result
    privateKeyRevealed = false // 개인키 노출 상태 초기화
    
    console.log('displayResults 호출됨:', { isShamir, hasPrivateKey: !!result.privateKey })
    
    // 기본 정보 표시
    keystoreContent.textContent = result.keystore
    publicKeyContent.textContent = result.publicKey
    addressContent.textContent = result.address
    
    // 개인키는 노출 버튼 클릭 시에만 표시되도록 설정
    privateKeyText.textContent = ''
    const warningElement = document.querySelector('.private-key-warning')
    const contentElement = document.getElementById('privateKeyContent')
    
    if (warningElement) {
        warningElement.style.display = 'block'
        console.log('개인키 경고 메시지 표시')
    }
    
    if (contentElement) {
        contentElement.style.display = 'none'
        console.log('개인키 내용 숨김')
    }
    
    // 복사/다운로드 버튼 비활성화
    if (copyPrivateKeyBtn) {
        copyPrivateKeyBtn.disabled = true
        console.log('개인키 복사 버튼 비활성화')
    }
    
    if (downloadPrivateKeyBtn) {
        downloadPrivateKeyBtn.disabled = true
        console.log('개인키 다운로드 버튼 비활성화')
    }

    // 공유 키 모드일 때 키스토어 탭 숨기기
    if (isShamir) {
        // 키스토어 탭 버튼 숨기기
        const keystoreTabBtn = document.querySelector('[data-tab="keystore"]')
        if (keystoreTabBtn) {
            keystoreTabBtn.style.display = 'none'
        }
        
        // 첫 번째로 사용 가능한 탭으로 전환
        const firstVisibleTab = document.querySelector('.tab-btn:not([style*="display: none"])')
        if (firstVisibleTab) {
            switchTab(firstVisibleTab.dataset.tab)
        }
    } else {
        // 일반 키스토어 모드일 때 키스토어 탭 표시
        const keystoreTabBtn = document.querySelector('[data-tab="keystore"]')
        if (keystoreTabBtn) {
            keystoreTabBtn.style.display = 'block'
        }
    }

    // 샤미르 쉐어 표시 (개별 다운로드 UI)
    if (isShamir && result.shares) {
        // Share key를 combine하여 복구된 주소 계산
        combineAndDisplayRecoveredAddress(result.shares, result.address)
        
        shareListElement.innerHTML = ''
        
        // Threshold 정보 표시
        const threshold = parseInt(thresholdInput.value)
        const thresholdInfo = document.createElement('div')
        thresholdInfo.className = 'threshold-info'
        thresholdInfo.innerHTML = `
            <div class="threshold-details">
                <strong>설정 정보:</strong> 총 ${result.shares.length}개 중 ${threshold}개로 복구 가능
            </div>
        `
        shareListElement.appendChild(thresholdInfo)
        
        result.shares.forEach((share, index) => {
            const shareDiv = document.createElement('div')
            shareDiv.className = 'share-item-compact'
            shareDiv.innerHTML = `
                <div class="share-item-header">
                    <span class="share-index">공유 키 ${index + 1}</span>
                    <span class="share-status">개별 암호화된 keystore로 다운로드</span>
                </div>
                <div class="share-password-inputs">
                    <div class="share-password-group">
                        <label for="sharePassword${index}">비밀번호:</label>
                        <input type="password" id="sharePassword${index}" placeholder="공유 키 ${index + 1} 비밀번호 입력">
                    </div>
                    <div class="share-password-group">
                        <label for="shareConfirmPassword${index}">비밀번호 확인:</label>
                        <input type="password" id="shareConfirmPassword${index}" placeholder="비밀번호 재입력">
                        <small id="sharePasswordMatch${index}" class="share-password-match"></small>
                    </div>
                    <button id="downloadShareBtn${index}" class="share-download-btn" disabled data-share-index="${index}">다운로드</button>
                </div>
            `
            shareListElement.appendChild(shareDiv)
            
            // 개별 Share 다운로드 이벤트 리스너 추가
            const passwordInput = document.getElementById(`sharePassword${index}`)
            const confirmPasswordInput = document.getElementById(`shareConfirmPassword${index}`)
            const passwordMatchElement = document.getElementById(`sharePasswordMatch${index}`)
            const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
            
            // 비밀번호 확인 이벤트 리스너
            passwordInput.addEventListener('input', () => checkSharePasswordMatch(index))
            confirmPasswordInput.addEventListener('input', () => checkSharePasswordMatch(index))
            
            // 다운로드 버튼 이벤트 리스너
            downloadBtn.addEventListener('click', () => handleDownloadShare(index))
        })
    }

    // 결과 섹션 표시
    resultsSection.style.display = 'block'
    
    // 첫 번째 탭으로 스크롤
    resultsSection.scrollIntoView({ behavior: 'smooth' })
}

// Share key를 combine하여 복구된 주소 표시
async function combineAndDisplayRecoveredAddress(shares, originalAddress) {
    try {
        const recoveredResult = await CombineShamirShares(shares)
        const recoveredAddress = recoveredResult.address
        
        if (recoveredAddressElement) {
            const isMatch = recoveredAddress.toLowerCase() === originalAddress.toLowerCase()
            const statusIcon = isMatch ? '✅' : '❌'
            const statusText = isMatch ? '일치' : '불일치'
            const statusColor = isMatch ? '#10b981' : '#ef4444'
            
            recoveredAddressElement.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>복구된 주소:</strong> ${recoveredAddress}
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <strong>원본 주소:</strong> ${originalAddress}
                </div>
                <div style="color: ${statusColor}; font-weight: 600;">
                    ${statusIcon} 주소 ${statusText}
                </div>
            `
            recoveredAddressElement.style.display = 'block'
        }
    } catch (error) {
        console.error('공유 키 combine 오류:', error)
        if (recoveredAddressElement) {
            recoveredAddressElement.innerHTML = `
                <div style="color: #ef4444; font-weight: 600;">
                    ❌ 공유 키 combine 실패: ${error.message}
                </div>
            `
            recoveredAddressElement.style.display = 'block'
        }
    }
}

// 탭 전환 처리
function switchTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active')
    })
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')
    document.getElementById(tabName).classList.add('active')
    
    currentTab = tabName
    
    // 개인키 탭일 때 일반 복사/다운로드 버튼 숨기기
    const actionButtons = document.querySelector('.action-buttons')
    if (actionButtons) {
        if (tabName === 'privateKey') {
            actionButtons.style.display = 'none'
        } else {
            actionButtons.style.display = 'flex'
        }
    }
}

// 복사 기능
async function handleCopy() {
    if (!currentResult) return

    // Share key 탭에서는 복사 기능 비활성화
    if (currentTab === 'shares') {
        showNotification('공유 키는 직접 복사할 수 없습니다. 다운로드 버튼을 사용하세요.')
        return
    }

    // 개인키 탭에서는 개인키 전용 복사 버튼 사용
    if (currentTab === 'privateKey') {
        showNotification('개인키는 "개인키 노출" 버튼을 클릭한 후 개인키 전용 복사 버튼을 사용하세요.')
        return
    }

    let textToCopy = ''
    
    switch (currentTab) {
        case 'keystore':
            textToCopy = currentResult.keystore
            break
        case 'publicKey':
            textToCopy = currentResult.publicKey
            break
        case 'address':
            textToCopy = currentResult.address
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

    // Share key 탭에서는 다운로드 기능 비활성화
    if (currentTab === 'shares') {
        showNotification('공유 키는 "모든 쉐어 다운로드" 버튼을 사용하세요.')
        return
    }

    // 개인키 탭에서는 개인키 전용 다운로드 버튼 사용
    if (currentTab === 'privateKey') {
        showNotification('개인키는 "개인키 노출" 버튼을 클릭한 후 개인키 전용 다운로드 버튼을 사용하세요.')
        return
    }

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
        case 'address':
            content = currentResult.address
            filename = `${addressWithoutPrefix}_address.txt`
            break
    }

    if (content && filename) {
        downloadFile(content, filename)
    }
}

// 샤미르 쉐어 키스토어 비밀번호 일치 확인
function checkSharePasswordMatch(index) {
    const passwordInput = document.getElementById(`sharePassword${index}`)
    const confirmPasswordInput = document.getElementById(`shareConfirmPassword${index}`)
    const passwordMatchElement = document.getElementById(`sharePasswordMatch${index}`)
    
    // 비밀번호 입력 필드 스타일 초기화
    passwordInput.classList.remove('error', 'success')
    confirmPasswordInput.classList.remove('error', 'success')
    passwordMatchElement.classList.remove('match', 'mismatch')
    passwordMatchElement.textContent = ''
    
    // 두 필드가 모두 비어있으면 아무것도 표시하지 않음
    if (!passwordInput.value && !confirmPasswordInput.value) {
        // 다운로드 버튼 비활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = true
        return
    }
    
    // 비밀번호 강도 검증
    const strengthValidation = validatePasswordStrength(passwordInput.value)
    
    // 비밀번호가 비어있으면 확인 필드에 에러 표시
    if (!passwordInput.value) {
        passwordInput.classList.add('error')
        passwordMatchElement.textContent = '공유 키 비밀번호를 먼저 입력하세요'
        passwordMatchElement.classList.add('mismatch')
        // 다운로드 버튼 비활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = true
        return
    }
    
    // 비밀번호 강도가 부족하면 에러 표시
    if (!strengthValidation.isValid) {
        passwordInput.classList.add('error')
        passwordMatchElement.textContent = `공유 키 비밀번호 요구사항: ${strengthValidation.errors.join(', ')}`
        passwordMatchElement.classList.add('mismatch')
        // 다운로드 버튼 비활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = true
        return
    }
    
    // 확인 비밀번호가 비어있으면
    if (!confirmPasswordInput.value) {
        passwordInput.classList.add('success')
        passwordMatchElement.textContent = '공유 키 비밀번호 확인을 입력하세요'
        // 다운로드 버튼 비활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = true
        return
    }
    
    // 비밀번호 일치 확인
    if (passwordInput.value === confirmPasswordInput.value) {
        passwordInput.classList.add('success')
        confirmPasswordInput.classList.add('success')
        passwordMatchElement.textContent = '✓ 공유 키 비밀번호가 일치합니다'
        passwordMatchElement.classList.add('match')
        // 다운로드 버튼 활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = false
    } else {
        passwordInput.classList.add('error')
        confirmPasswordInput.classList.add('error')
        passwordMatchElement.textContent = '✗ 공유 키 비밀번호가 일치하지 않습니다'
        passwordMatchElement.classList.add('mismatch')
        // 다운로드 버튼 비활성화
        const downloadBtn = document.getElementById(`downloadShareBtn${index}`)
        downloadBtn.disabled = true
    }
}

// 샤미르 쉐어 개별 다운로드
async function handleDownloadShare(index) {
    const password = document.getElementById(`sharePassword${index}`).value.trim()
    const confirmPassword = document.getElementById(`shareConfirmPassword${index}`).value.trim()

    if (!password) {
        alert('공유 키 비밀번호를 입력해주세요.')
        return
    }

    // 비밀번호 강도 재검증
    const strengthValidation = validatePasswordStrength(password)
    if (!strengthValidation.isValid) {
        alert(`공유 키 비밀번호가 요구사항을 충족하지 않습니다:\n${strengthValidation.errors.join('\n')}`)
        return
    }

    if (password !== confirmPassword) {
        alert('공유 키 비밀번호가 일치하지 않습니다.')
        return
    }

    if (!currentResult || !currentResult.shares) {
        alert('공유 키가 생성되지 않았습니다.')
        return
    }

    try {
        const shareKeystore = await CreateShareKeystore(
            currentResult.shares[index], 
            password, 
            index + 1, 
            currentResult.address
        )
        
        const addressWithoutPrefix = currentResult.address.replace('0x', '')
        const filename = `${addressWithoutPrefix}_sharekey_${index + 1}.json`
        await downloadFile(shareKeystore.keystore, filename)

        showNotification(`공유 키 ${index + 1} 키스토어가 다운로드되었습니다!`)

    } catch (error) {
        console.error(`공유 키 ${index + 1} 다운로드 실패:`, error)
        alert(`공유 키 ${index + 1} 다운로드에 실패했습니다: ${error.message}`)
    }
}

// 개인키 노출 처리
function handleRevealPrivateKey() {
    console.log('개인키 노출 버튼 클릭됨')
    if (!currentResult) {
        console.log('currentResult가 없음')
        return
    }
    
    console.log('개인키 노출 확인 대화상자 표시')
    
    // 임시로 확인 대화상자 제거하고 바로 노출
    console.log('개인키 노출 확인됨 (임시)')
    console.log('개인키:', currentResult.privateKey)
    
    // 개인키 노출
    if (privateKeyText) {
        privateKeyText.textContent = currentResult.privateKey
        console.log('개인키 텍스트 설정 완료')
    } else {
        console.error('privateKeyText 요소를 찾을 수 없음')
    }
    
    const warningElement = document.querySelector('.private-key-warning')
    const contentElement = document.getElementById('privateKeyContent')
    
    if (warningElement) {
        warningElement.style.display = 'none'
        console.log('경고 메시지 숨김')
    } else {
        console.error('경고 요소를 찾을 수 없음')
    }
    
    if (contentElement) {
        contentElement.style.display = 'block'
        console.log('개인키 내용 표시')
    } else {
        console.error('개인키 내용 요소를 찾을 수 없음')
    }
    
    // 복사/다운로드 버튼 활성화
    if (copyPrivateKeyBtn) {
        copyPrivateKeyBtn.disabled = false
        console.log('개인키 복사 버튼 활성화')
    } else {
        console.error('개인키 복사 버튼을 찾을 수 없음')
    }
    
    if (downloadPrivateKeyBtn) {
        downloadPrivateKeyBtn.disabled = false
        console.log('개인키 다운로드 버튼 활성화')
    } else {
        console.error('개인키 다운로드 버튼을 찾을 수 없음')
    }
    
    privateKeyRevealed = true
    
    showNotification('개인키가 노출되었습니다. 안전한 환경에서만 사용하세요!')
}

// 개인키 복사
async function handleCopyPrivateKey() {
    if (!currentResult || !privateKeyRevealed) return
    
    try {
        await navigator.clipboard.writeText(currentResult.privateKey)
        showNotification('개인키가 클립보드에 복사되었습니다!')
    } catch (error) {
        console.error('개인키 복사 실패:', error)
        alert('개인키 복사에 실패했습니다.')
    }
}

// 개인키 다운로드
function handleDownloadPrivateKey() {
    if (!currentResult || !privateKeyRevealed) return
    
    const addressWithoutPrefix = currentResult.address.replace('0x', '')
    const filename = `${addressWithoutPrefix}_private_key.txt`
    const content = currentResult.privateKey
    
    downloadFile(content, filename)
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

totalSharesInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!generateBtn.disabled) {
            handleGenerate()
        }
    }
})

thresholdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!generateBtn.disabled) {
            handleGenerate()
        }
    }
})

// 페이지 로드 시 초기 UI 설정
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료')
    console.log('개인키 관련 요소들:', {
        revealBtn: !!revealPrivateKeyBtn,
        privateKeyText: !!privateKeyText,
        copyBtn: !!copyPrivateKeyBtn,
        downloadBtn: !!downloadPrivateKeyBtn
    })
    
    updateUIForShareCount()
})

// 총 개수에 따라 UI 업데이트
function updateUIForShareCount() {
    const totalShares = parseInt(totalSharesInput.value) || 1
    let threshold = parseInt(thresholdInput.value) || 2
    
    // 총 개수가 1일 때
    if (totalShares === 1) {
        // 일반 키스토어 모드
        document.querySelector('.form-section').classList.add('keystore-mode')
        document.querySelector('.form-section').classList.remove('share-mode')
        
        // 공유 키 설정 비활성화 (숨기지 않음)
        document.querySelector('.share-config').classList.add('disabled')
        totalSharesInput.disabled = false // 총 개수는 변경 가능
        thresholdInput.disabled = true // threshold는 비활성화
        thresholdInput.value = 1 // threshold를 1로 설정
        
        // 비밀번호 입력 필드 표시
        passwordInput.parentElement.style.display = 'block'
        confirmPasswordInput.parentElement.style.display = 'block'
        
        // 공유 키 탭 숨기기
        sharesTab.style.display = 'none'
        
    } else {
        // 공유 키 모드
        document.querySelector('.form-section').classList.add('share-mode')
        document.querySelector('.form-section').classList.remove('keystore-mode')
        
        // 공유 키 설정 활성화
        document.querySelector('.share-config').classList.remove('disabled')
        totalSharesInput.disabled = false
        thresholdInput.disabled = false
        
        // 비밀번호 입력 필드 숨기기
        passwordInput.parentElement.style.display = 'none'
        confirmPasswordInput.parentElement.style.display = 'none'
        
        // 공유 키 탭 표시
        sharesTab.style.display = 'block'
        
        // Threshold 검증 및 설정
        if (threshold < 2) {
            threshold = 2
            thresholdInput.value = 2
        }
        if (threshold > totalShares) {
            threshold = totalShares
            thresholdInput.value = totalShares
        }
        
        // 공유 키 모드에서는 키 생성 버튼 활성화
        generateBtn.disabled = false
    }
    
    // 비밀번호 확인 상태 재검사 (일반 키스토어 모드에서만)
    if (totalShares === 1) {
        checkPasswordMatch()
    }
}
