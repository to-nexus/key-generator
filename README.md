# NEXUS Key Generator

EVM-compatible keystore and shared key generator. Supports standard keystores and shared key generation through Shamir Secret Sharing.

## 📦 Releases

### v1.0.2 (2024-08-06)
- Comprehensive test suite for Shamir Secret Sharing and keystore recovery
- Test implementation using actual app.go functions
- Keystore improvements using go-ethereum/accounts/keystore package
- Test structure improvements with root-level test files

**Download:**
- [GitHub Releases Page](https://github.com/to-nexus/key-generator/releases/tag/v1.0.2)

## Features

### Key Generation
- **Standard Keystore**: Generate standard EVM keystores
- **Shared Keys (Shamir Secret Sharing)**: Split into N shares, recover with K shares
- **Threshold Method**: Flexible split/recovery settings (e.g., 3 out of 5)

### Security
- **Enhanced Passwords**: Special characters, uppercase, lowercase, numbers required
- **Individual Encryption**: Independent passwords for each shared key
- **Recovery Verification**: Verify original address through shared key combination
- **Direct Exposure Prevention**: Shared keys only available as keystore format

### User Experience
- **Dynamic UI**: Display only necessary input fields based on mode
- **Real-time Validation**: Password strength and match verification
- **Hot Reload**: Real-time code reflection in development mode
- **Cross-platform**: macOS, Windows support

## Usage

### Standard Keystore Generation
1. Set **Total Count** to 1
2. Enter password (8+ characters, special characters included)
3. Click **Generate Key** button
4. Check results: keystore, public key, private key, address

### Shared Key Generation
1. Set **Total Count** to 2-10
2. Set **Recovery Minimum Count** between 2 and total count
3. Click **Generate Key** button
4. Set password for each shared key and download individually

### Filename Rules
- **Standard Keystore**: `{address}_keystore.json`
- **Shared Keys**: `{address}_sharekey_{number}.json`
- **Others**: `{address}_{type}.txt`

## Technology Stack

### Backend
- **Go**: Backend language
- **Wails**: Cross-platform desktop app framework
- **go-ethereum**: Ethereum cryptography library
- **hashicorp/vault/shamir**: Shamir Secret Sharing

### Frontend
- **HTML5/CSS3**: UI structure and styling
- **Vanilla JavaScript**: Frontend logic
- **Vite**: Development tools and bundling

## Project Structure

```
key-generator/
├── app.go                 # Backend logic
├── frontend/
│   ├── index.html        # Main UI
│   ├── src/
│   │   ├── main.js       # Frontend logic
│   │   └── style.css     # Styling
│   └── package.json      # Frontend dependencies
├── go.mod                # Go module
├── README.md             # Project documentation
├── SECURITY.md           # Security policy
└── .gitignore           # Git ignore file
```

## Development

### Prerequisites
- **Go**: 1.19 or higher
- **Node.js**: 16 or higher
- **Wails CLI**: Latest version

### Installation

**Go Installation**
```bash
# macOS (Homebrew)
brew install go

# Windows (Chocolatey)
choco install golang

# Linux
sudo apt-get install golang-go
```

**Node.js Installation**
```bash
# macOS (Homebrew)
brew install node

# Windows (Chocolatey)
choco install nodejs

# Linux
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Wails CLI Installation**
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Development Mode

**Hot Reload Mode (Recommended)**
```bash
wails dev
```

**Build and Run**
```bash
wails build
./build/bin/key-generator
```

**Debug Mode**
```bash
wails dev -debug
```

### Platform Builds

**macOS Build**
```bash
# Intel Mac
wails build -platform darwin/amd64

# Apple Silicon Mac
wails build -platform darwin/arm64

# Universal Binary
wails build -platform darwin/universal
```

**Windows Build**
```bash
# 64-bit Windows
wails build -platform windows/amd64

# 32-bit Windows
wails build -platform windows/386
```

**Linux Build**
```bash
# 64-bit Linux
wails build -platform linux/amd64

# ARM64 Linux
wails build -platform linux/arm64
```

### Build Options

**Production Build**
```bash
wails build -clean
```

**Development Build**
```bash
wails build -devtools
```

**Compressed Build**
```bash
wails build -compress
```

### Deployment

**Clean Build**
```bash
rm -rf build/
wails build -clean
```

**Package for Distribution**
```bash
# macOS
wails build -platform darwin/universal -package

# Windows
wails build -platform windows/amd64 -package

# Linux
wails build -platform linux/amd64 -package
```

### Troubleshooting

**Go Version Issues**
```bash
go version
# Ensure version is 1.19 or higher
```

**Node.js Version Issues**
```bash
node --version
npm --version
# Ensure Node.js 16+ and npm are installed
```

**Wails CLI Issues**
```bash
wails doctor
# Run diagnostics to identify issues
```

**Build Failures**
```bash
# Clean and rebuild
rm -rf build/
wails build -clean
```

**Frontend Issues**
```bash
cd frontend
npm install
npm run dev
```

### Development Tips

**Hot Reload Development**
- Use `wails dev` for fastest development cycle
- Frontend changes reflect immediately
- Backend changes require restart

**Debugging**
- Use `wails dev -debug` for detailed logging
- Check browser console for frontend errors
- Check terminal for backend errors

**Testing**
```bash
# Run all tests
go test -v

# Run specific test
go test -v -run TestShareRecovery
```

**Code Quality**
```bash
# Format Go code
go fmt ./...

# Lint Go code
golangci-lint run

# Check for security issues
go vet ./...
```

## Disclaimer

This software is provided free of charge, but the developers are not responsible for any consequences arising from its use.

### Developer Responsibility Exemption
The developers are not liable for:
- Asset loss from cryptocurrency or digital assets
- Security vulnerabilities or breaches
- Software bugs or malfunctions
- Loss of keystores, private keys, or other data
- Compliance with local laws and regulations

### User Responsibilities
Users are responsible for:
- Using the software in a secure environment
- Properly backing up keystores and private keys
- Using strong, unique passwords
- Keeping the software updated

### Recommendations
- Test in a safe environment before using with real assets
- Start with small amounts when testing
- Gain sufficient knowledge about cryptocurrency security

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

## Security

For security concerns, please review our [Security Policy](SECURITY.md).
