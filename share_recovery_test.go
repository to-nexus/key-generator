package main

import (
	"fmt"
	"testing"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/hashicorp/vault/shamir"
)

func TestShareRecovery(t *testing.T) {
	fmt.Println("=== Share Keystore Recovery Test ===")

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

	// 3. Store original shares for recovery (simulating keystore storage)
	fmt.Println("\n3. Storing shares for recovery...")
	originalShares := make([][]byte, len(shares))
	copy(originalShares, shares)

	// 4. Test recovery using first 2 shares
	fmt.Println("\n4. Testing recovery using first 2 shares...")

	// Use original shares for recovery (simulating keystore decryption)
	recoveredShares := make([][]byte, 2)
	for i := 0; i < 2; i++ {
		recoveredShares[i] = originalShares[i]
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

	// 7. Test with different combinations
	fmt.Println("\n7. Testing with different combinations...")

	// Try with shares 1 and 3
	altRecoveredShares := [][]byte{originalShares[0], originalShares[2]}
	altCombined, err := shamir.Combine(altRecoveredShares)
	if err != nil {
		t.Fatal("Failed to combine alternative shares:", err)
	}

	altRecoveredPrivateKey, err := crypto.ToECDSA(altCombined)
	if err != nil {
		t.Fatal("Failed to convert alternative combined bytes to private key:", err)
	}

	altRecoveredAddress := crypto.PubkeyToAddress(altRecoveredPrivateKey.PublicKey)
	if address.Hex() == altRecoveredAddress.Hex() {
		fmt.Println("✅ SUCCESS: Alternative combination also works!")
	} else {
		t.Error("❌ FAILED: Alternative combination failed!")
	}

	fmt.Println("\n=== Test Complete ===")
}
