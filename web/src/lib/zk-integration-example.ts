// ZK Integration Example - How to integrate your actual ZK circuit blueprint
import { loadZKBlueprint } from './zk-email';
import { zkEmailService } from './zk-email';

/**
 * Example: How to integrate your ZK circuit blueprint
 * 
 * STEP 1: Place your circuit files in the public/circuits/ directory:
 * - email-verification.wasm (compiled circuit)
 * - email-verification.zkey (proving key) 
 * - email-verification.vkey.json (verification key)
 * 
 * STEP 2: Load your blueprint when the app starts
 */
export const initializeZKCircuit = async () => {
  try {
    console.log("🔄 Loading ZK circuit blueprint...");
    
    // Load your circuit files
    const wasmResponse = await fetch('/circuits/email-verification.wasm');
    const zkeyResponse = await fetch('/circuits/email-verification.zkey');
    const vkeyResponse = await fetch('/circuits/email-verification.vkey.json');
    
    if (!wasmResponse.ok || !zkeyResponse.ok || !vkeyResponse.ok) {
      throw new Error("Failed to load circuit files");
    }
    
    const blueprint = {
      wasm: await wasmResponse.arrayBuffer(),
      zkey: await zkeyResponse.arrayBuffer(),
      vkey: await vkeyResponse.arrayBuffer()
    };
    
    // Load the blueprint into the ZK email service
    await loadZKBlueprint(blueprint);
    
    console.log("✅ ZK circuit blueprint loaded successfully!");
    return true;
    
  } catch (error) {
    console.error("❌ Failed to load ZK circuit blueprint:", error);
    console.log("💡 Make sure your circuit files are in public/circuits/ directory");
    return false;
  }
};

/**
 * Example: How to use the ZK email verification with your blueprint
 */
export const verifyEmailWithZK = async (emlContent: string, verificationType: 'hackerhouse' | 'netflix' = 'hackerhouse') => {
  try {
    console.log("🔄 Starting ZK email verification...");
    
    // This will now use your actual ZK circuit instead of mock proof
    const result = await zkEmailService.verifyEmail(emlContent, verificationType);
    
    if (result.isValid) {
      console.log("✅ ZK verification successful!");
      console.log("📦 Lighthouse CID:", result.lighthouseCID);
      console.log("🔐 Proof Hash:", result.proofHash);
      return result;
    } else {
      throw new Error("ZK verification failed");
    }
    
  } catch (error) {
    console.error("❌ ZK email verification failed:", error);
    throw error;
  }
};

/**
 * Example: Initialize ZK circuit on app startup
 * Call this in your main app component or layout
 */
export const setupZKVerification = async () => {
  // Try to load the ZK circuit
  const circuitLoaded = await initializeZKCircuit();
  
  if (circuitLoaded) {
    console.log("🚀 ZK Email verification ready with actual circuit!");
  } else {
    console.log("⚠️ ZK Email verification running in mock mode");
    console.log("💡 To enable real ZK verification, add your circuit files to public/circuits/");
  }
  
  return circuitLoaded;
};
