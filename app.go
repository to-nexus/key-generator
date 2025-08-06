package main

import (
	"context"
	"crypto/ecdsa"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/hashicorp/vault/shamir"
)

// App struct
type App struct {
	ctx context.Context
}

// KeyResult represents the result of key generation
type KeyResult struct {
	Keystore   string `json:"keystore"`
	PublicKey  string `json:"publicKey"`
	PrivateKey string `json:"privateKey"`
	Address    string `json:"address"`
}

// ShamirResult represents the result of Shamir secret sharing
type ShamirResult struct {
	Shares []string `json:"shares"`
	KeyResult
}

// ShareKeystoreResult represents a single share keystore
type ShareKeystoreResult struct {
	Keystore string `json:"keystore"`
	Index    int    `json:"index"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SaveFileToDownloads saves content to a file in the Downloads folder
func (a *App) SaveFileToDownloads(filename string, content string) error {
	downloadPath := a.getDownloadPath()
	fullPath := filepath.Join(downloadPath, filename)

	err := os.WriteFile(fullPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("failed to save file: %v", err)
	}

	return nil
}

// OpenDownloadFolder opens the download folder in the file explorer
func (a *App) OpenDownloadFolder() error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", "-R", a.getDownloadPath())
	case "windows":
		cmd = exec.Command("explorer", a.getDownloadPath())
	case "linux":
		cmd = exec.Command("xdg-open", a.getDownloadPath())
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	return cmd.Run()
}

// GetDownloadPath returns the download folder path
func (a *App) GetDownloadPath() string {
	return a.getDownloadPath()
}

// getDownloadPath returns the download folder path
func (a *App) getDownloadPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "."
	}

	switch runtime.GOOS {
	case "darwin": // macOS
		return filepath.Join(homeDir, "Downloads")
	case "windows":
		return filepath.Join(homeDir, "Downloads")
	case "linux":
		return filepath.Join(homeDir, "Downloads")
	default:
		return "."
	}
}

// GenerateKey generates a single EVM key pair
func (a *App) GenerateKey(password string) (*KeyResult, error) {
	// Generate private key
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate private key: %v", err)
	}

	// Get public key
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to get public key")
	}

	// Get address
	address := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Create keystore (simplified version)
	keystore := createKeystore(privateKey, password)

	return &KeyResult{
		Keystore:   keystore,
		PublicKey:  hex.EncodeToString(crypto.FromECDSAPub(publicKeyECDSA)),
		PrivateKey: hex.EncodeToString(crypto.FromECDSA(privateKey)),
		Address:    address.Hex(),
	}, nil
}

// GenerateShamirShares generates Shamir secret sharing for the given number of shares
func (a *App) GenerateShamirShares(password string, totalShares int, threshold int) (*ShamirResult, error) {
	// Generate private key
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate private key: %v", err)
	}

	// Get public key
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to get public key")
	}

	// Get address
	address := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Convert private key to bytes
	privateKeyBytes := crypto.FromECDSA(privateKey)

	// Generate Shamir shares with threshold
	shares, err := shamir.Split(privateKeyBytes, totalShares, threshold)
	if err != nil {
		return nil, fmt.Errorf("failed to generate Shamir shares: %v", err)
	}

	// Convert shares to hex strings (for internal use only)
	shareStrings := make([]string, len(shares))
	for i, share := range shares {
		shareStrings[i] = hex.EncodeToString(share)
	}

	// 공유 키 모드에서는 키스토어를 생성하지 않음
	// 대신 빈 문자열이나 간단한 메시지 반환
	keystore := "공유 키 모드에서는 개별 공유 키를 다운로드하세요."

	return &ShamirResult{
		Shares: shareStrings,
		KeyResult: KeyResult{
			Keystore:   keystore,
			PublicKey:  hex.EncodeToString(crypto.FromECDSAPub(publicKeyECDSA)),
			PrivateKey: hex.EncodeToString(privateKeyBytes),
			Address:    address.Hex(),
		},
	}, nil
}

// CombineShamirShares combines Shamir shares to recover the original private key
func (a *App) CombineShamirShares(shares []string) (*KeyResult, error) {
	// Convert hex shares to bytes
	shareBytes := make([][]byte, len(shares))
	for i, shareHex := range shares {
		shareBytes[i], _ = hex.DecodeString(shareHex)
	}

	// Combine shares to recover the original private key
	recoveredBytes, err := shamir.Combine(shareBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to combine shares: %v", err)
	}

	// Convert recovered bytes to private key
	privateKey, err := crypto.ToECDSA(recoveredBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to convert recovered bytes to private key: %v", err)
	}

	// Get public key
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to get public key")
	}

	// Get address
	address := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Create keystore (simplified version)
	keystore := createKeystore(privateKey, "recovered_password")

	return &KeyResult{
		Keystore:   keystore,
		PublicKey:  hex.EncodeToString(crypto.FromECDSAPub(publicKeyECDSA)),
		PrivateKey: hex.EncodeToString(crypto.FromECDSA(privateKey)),
		Address:    address.Hex(),
	}, nil
}

// CreateShareKeystore creates a keystore for a specific share
func (a *App) CreateShareKeystore(shareHex string, password string, index int, address string) (*ShareKeystoreResult, error) {
	// Decode share from hex
	shareBytes, err := hex.DecodeString(shareHex)
	if err != nil {
		return nil, fmt.Errorf("failed to decode share: %v", err)
	}

	// Create a keystore for the share
	// Note: This is a simplified keystore for the share
	keystoreData := map[string]interface{}{
		"version":    3,
		"id":         generateUUID(),
		"address":    address,
		"shareIndex": index,
		"crypto": map[string]interface{}{
			"cipher":       "aes-128-ctr",
			"ciphertext":   hex.EncodeToString(shareBytes), // Store the actual share
			"cipherparams": map[string]interface{}{"iv": hex.EncodeToString([]byte("initialization_vector"))},
			"kdf":          "scrypt",
			"kdfparams": map[string]interface{}{
				"dklen": 32,
				"salt":  hex.EncodeToString([]byte("salt")),
				"n":     262144,
				"r":     8,
				"p":     1,
			},
			"mac": hex.EncodeToString([]byte("mac")),
		},
	}

	keystoreJSON, _ := json.MarshalIndent(keystoreData, "", "  ")

	return &ShareKeystoreResult{
		Keystore: string(keystoreJSON),
		Index:    index,
	}, nil
}

// createKeystore creates a simplified keystore JSON
func createKeystore(privateKey *ecdsa.PrivateKey, password string) string {
	// This is a simplified keystore format
	// In a real application, you would use proper encryption
	keystoreData := map[string]interface{}{
		"version": 3,
		"id":      generateUUID(),
		"address": crypto.PubkeyToAddress(privateKey.PublicKey).Hex(),
		"crypto": map[string]interface{}{
			"cipher":       "aes-128-ctr",
			"ciphertext":   hex.EncodeToString([]byte("encrypted_private_key")), // Simplified
			"cipherparams": map[string]interface{}{"iv": hex.EncodeToString([]byte("initialization_vector"))},
			"kdf":          "scrypt",
			"kdfparams": map[string]interface{}{
				"dklen": 32,
				"salt":  hex.EncodeToString([]byte("salt")),
				"n":     262144,
				"r":     8,
				"p":     1,
			},
			"mac": hex.EncodeToString([]byte("mac")),
		},
	}

	keystoreJSON, _ := json.MarshalIndent(keystoreData, "", "  ")
	return string(keystoreJSON)
}

// generateUUID generates a simple UUID-like string
func generateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
