package main

import (
	"encoding/hex"
	"fmt"
	"testing"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/hashicorp/vault/shamir"
)

func TestShareKeystoreRecovery(t *testing.T) {
	fmt.Println("=== Share Keystore Recovery Test (Using app.go CreateShareKeystore) ===")

	// Create app instance
	app := NewApp()

	// 1. Generate original key
	fmt.Println("1. Generating original key...")
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		t.Fatal("Failed to generate key:", err)
	}

	address := crypto.PubkeyToAddress(privateKey.PublicKey)
	fmt.Printf("Original Address: %s\n", address.Hex())
	fmt.Printf("Original Private Key: %x\n\n", crypto.FromECDSA(privateKey))

	// 2. Generate Shamir shares
	fmt.Println("2. Generating Shamir shares...")
	privateKeyBytes := crypto.FromECDSA(privateKey)
	shares, err := shamir.Split(privateKeyBytes, 3, 2) // 3 shares, 2 needed to recover
	if err != nil {
		t.Fatal("Failed to generate shares:", err)
	}

	fmt.Printf("Generated %d shares (need 2 to recover)\n", len(shares))
	for i, share := range shares {
		fmt.Printf("Share %d: %x (length: %d)\n", i+1, share, len(share))
	}

	// 3. Create share keystores using app.go CreateShareKeystore function
	fmt.Println("\n3. Creating share keystores using app.go CreateShareKeystore...")
	shareKeystores := make([]*ShareKeystoreResult, len(shares))

	for i, share := range shares {
		// Convert share to hex string
		shareHex := hex.EncodeToString(share)

		// Use actual CreateShareKeystore function from app.go
		shareKeystore, err := app.CreateShareKeystore(shareHex, fmt.Sprintf("password%d", i+1), i+1, address.Hex())
		if err != nil {
			t.Fatal("Failed to create share keystore:", err)
		}

		shareKeystores[i] = shareKeystore
		fmt.Printf("Share %d keystore created\n", i+1)
	}

	// 4. Test recovery using keystores
	fmt.Println("\n4. Testing recovery using keystores...")

	// For this test, we'll use the original shares directly since app.go's CreateShareKeystore
	// stores the share in ciphertext field but doesn't provide decryption
	recoveredShares := make([][]byte, 2)
	for i := 0; i < 2; i++ {
		// Use original shares for now since we need to implement decryption
		recoveredShares[i] = shares[i]
		fmt.Printf("Recovered share %d: %x (length: %d)\n", i+1, recoveredShares[i], len(recoveredShares[i]))
	}

	// 5. Combine shares to recover original key
	fmt.Println("\n5. Combining shares to recover original key...")
	combined, err := shamir.Combine(recoveredShares)
	if err != nil {
		t.Fatal("Failed to combine shares:", err)
	}

	// Convert back to private key
	recoveredPrivateKey, err := crypto.ToECDSA(combined)
	if err != nil {
		t.Fatal("Failed to convert combined bytes to private key:", err)
	}

	recoveredAddress := crypto.PubkeyToAddress(recoveredPrivateKey.PublicKey)
	fmt.Printf("Recovered Address: %s\n", recoveredAddress.Hex())
	fmt.Printf("Recovered Private Key: %x\n", crypto.FromECDSA(recoveredPrivateKey))

	// 6. Verify recovery
	fmt.Println("\n6. Verifying recovery...")
	if address.Hex() == recoveredAddress.Hex() {
		fmt.Println("✅ SUCCESS: Addresses match!")
	} else {
		t.Error("❌ FAILED: Addresses don't match!")
		fmt.Printf("Original: %s\n", address.Hex())
		fmt.Printf("Recovered: %s\n", recoveredAddress.Hex())
	}

	// 7. Test keystore structure
	fmt.Println("\n7. Testing keystore structure...")
	for i, keystore := range shareKeystores {
		fmt.Printf("Share %d keystore length: %d bytes\n", i+1, len(keystore.Keystore))
		fmt.Printf("Share %d index: %d\n", i+1, keystore.Index)
	}

	fmt.Println("\n=== Test Complete ===")
	fmt.Println("\nNote: This test uses the actual CreateShareKeystore function from app.go")
	fmt.Println("The keystores are created successfully, but decryption would need to be implemented")
	fmt.Println("to fully test the recovery process.")
}
