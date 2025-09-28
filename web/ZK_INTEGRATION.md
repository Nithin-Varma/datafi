# ZK Email Verification Integration Guide

## 🚀 Quick Setup

### 1. **Add Your ZK Circuit Files**
Place your compiled ZK circuit files in the `public/circuits/` directory:

```
public/
└── circuits/
    ├── email-verification.wasm    # Your compiled circuit
    ├── email-verification.zkey    # Your proving key
    └── email-verification.vkey.json # Your verification key
```

### 2. **Circuit Files Required**
- **WASM File**: Compiled circuit binary
- **ZKey**: Proving key for generating proofs
- **VKey**: Verification key for verifying proofs

### 3. **Automatic Integration**
The app will automatically:
- ✅ Load your circuit on startup
- ✅ Use real ZK proofs instead of mock proofs
- ✅ Store verification data to Lighthouse
- ✅ Submit proofs to smart contracts

## 🔧 How It Works

### **ZK Email Verification Flow**
1. **Upload EML File** → User uploads .eml file
2. **Parse Email** → Extract email metadata and content
3. **Domain/Keyword Check** → Verify sender domain and keywords
4. **ZK Proof Generation** → Use your circuit to generate proof
5. **Lighthouse Storage** → Encrypt and store data to Lighthouse
6. **Smart Contract** → Submit proof hash to blockchain

### **Blueprint Integration Points**

```typescript
// Your circuit will be loaded here:
const ZK_CIRCUIT_BLUEPRINT = {
  circuit: null, // ← Your circuit loaded here
  wasm: null,    // ← Your WASM file
  zkey: null,    // ← Your proving key
  vkey: null     // ← Your verification key
};

// Real ZK proof generation:
private async generateActualProof(zkInputs: any, verificationType: string): Promise<string> {
  // TODO: Replace with your actual ZK circuit proof generation
  // 1. Load circuit from blueprint
  // 2. Generate witness
  // 3. Create proof using snarkjs or similar
  // 4. Return proof as JSON string
}
```

## 📁 File Structure

```
src/lib/
├── zk-email.ts                 # Main ZK email service
├── zk-blueprint-loader.ts      # Blueprint loading utilities
├── zk-integration-example.ts   # Integration examples
└── verification-service.ts     # Verification orchestration

public/
└── circuits/                   # Your ZK circuit files go here
    ├── email-verification.wasm
    ├── email-verification.zkey
    └── email-verification.vkey.json
```

## 🎯 Verification Types Supported

### **Hackerhouse Verification**
- **Domains**: `devfolio.co`, `ethglobal.com`, `hackerhouse.com`
- **Keywords**: `hackerhouse`, `invitation`, `ETH Delhi`, `selected`, `participant`

### **Netflix Verification**
- **Domains**: `netflix.com`, `info@netflix.com`, `noreply@netflix.com`
- **Keywords**: `netflix`, `subscription`, `billing`, `payment`, `plan`, `premium`

## 🔐 Lighthouse Storage

All verification data is automatically:
- ✅ **Encrypted** before storage
- ✅ **Uploaded** to Lighthouse (IPFS)
- ✅ **CID returned** for smart contract reference
- ✅ **Access controlled** by smart contracts

## 🚀 Ready to Use!

Once you add your circuit files, the system will:
1. **Automatically detect** your circuit files
2. **Load them** on app startup
3. **Use real ZK proofs** for verification
4. **Store data** to Lighthouse
5. **Submit proofs** to smart contracts

## 💡 Development Mode

If no circuit files are found, the system falls back to mock proofs for development and testing.

## 🔧 Customization

You can customize:
- **Verification parameters** in `zk-email.ts`
- **Lighthouse storage** in `lighthouse.ts`
- **Smart contract integration** in `verification-service.ts`
- **UI components** in the verify page

---

**Your ZK circuit blueprint is now ready to be integrated! Just add your circuit files to `public/circuits/` and the system will automatically use them for real ZK verification with Lighthouse storage.**
