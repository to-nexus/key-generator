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
func (a *App) GenerateShamirShares(password string, numShares int) (*ShamirResult, error) {
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

	// Generate Shamir shares
	shares, err := shamir.Split(privateKeyBytes, numShares, numShares)
	if err != nil {
		return nil, fmt.Errorf("failed to generate Shamir shares: %v", err)
	}

	// Convert shares to hex strings
	shareStrings := make([]string, len(shares))
	for i, share := range shares {
		shareStrings[i] = hex.EncodeToString(share)
	}

	// Create keystore
	keystore := createKeystore(privateKey, password)

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
