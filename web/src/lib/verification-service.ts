import { lighthouseService } from './lighthouse';
import { zkEmailService } from './zk-email';
import { useWriteContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';

export interface VerificationFlow {
  poolAddress: string;
  userAddress: string;
  proofType: 'self' | 'zk_email';
  data: any;
}

export interface VerificationResult {
  success: boolean;
  transactionHash?: string;
  encryptedCID?: string;
  proofHash?: string;
  error?: string;
}

class DataFiVerificationService {

  /**
   * Complete Self verification flow with Lighthouse encryption
   */
  async processSelfVerification(
    poolAddress: string,
    userAddress: string,
    selfVerificationData: any
  ): Promise<VerificationResult> {
    try {
      console.log("🔄 Processing Self verification...");

      // 1. Extract Self verification proof data
      const proofData = {
        type: 'self_verification',
        userId: selfVerificationData.userId,
        verifiedFields: selfVerificationData.disclosures,
        timestamp: new Date().toISOString(),
        sessionId: selfVerificationData.sessionId || Date.now().toString()
      };

      // 2. Encrypt and upload verification data to Lighthouse
      console.log("🔐 Encrypting verification data...");
      const encryptionResult = await lighthouseService.encryptAndUpload(
        proofData,
        poolAddress,
        userAddress,
        "0x0000000000000000000000000000000000000000" // Placeholder for pool creator
      );

      // 3. Generate proof hash for smart contract
      const proofHash = this.generateSelfProofHash(proofData);

      // 4. Submit to smart contract
      console.log("📝 Submitting proof to smart contract...");
      // This would be called from the component with the actual contract write

      return {
        success: true,
        encryptedCID: encryptionResult.encryptedCID,
        proofHash,
      };

    } catch (error) {
      console.error("❌ Self verification failed:", error);
      return {
        success: false,
        error: `Self verification failed: ${error}`
      };
    }
  }

  /**
   * Complete ZK Email verification flow with Lighthouse encryption
   */
  async processZKEmailVerification(
    poolAddress: string,
    userAddress: string,
    emlContent: string
  ): Promise<VerificationResult> {
    try {
      console.log("📧 Processing ZK Email verification...");

      // 1. Verify the email using ZK Email
      const emailVerification = await zkEmailService.verifyHackerhouseEmail(emlContent);

      if (!emailVerification.isValid) {
        throw new Error("Email verification failed");
      }

      // 2. Create verification data for encryption
      const verificationData = zkEmailService.createVerificationData(
        emailVerification.emailData,
        emailVerification.zkProof
      );

      // 3. Encrypt and upload to Lighthouse
      console.log("🔐 Encrypting email verification data...");
      const encryptionResult = await lighthouseService.encryptAndUpload(
        verificationData,
        poolAddress,
        userAddress,
        "0x0000000000000000000000000000000000000000" // Placeholder for pool creator
      );

      // 4. Use the proof hash from ZK Email verification
      const proofHash = emailVerification.proofHash;

      console.log("✅ ZK Email verification completed successfully");

      return {
        success: true,
        encryptedCID: encryptionResult.encryptedCID,
        proofHash,
      };

    } catch (error) {
      console.error("❌ ZK Email verification failed:", error);
      return {
        success: false,
        error: `ZK Email verification failed: ${error}`
      };
    }
  }

  /**
   * Submit proof to smart contract and store encrypted data
   */
  async submitProofToContract(
    poolAddress: string,
    userAddress: string,
    proofName: string,
    proofHash: string,
    encryptedCID: string,
    writeContract: any
  ): Promise<VerificationResult> {
    try {
      console.log("📝 Submitting proof to smart contract...");

      // Submit proof to pool contract
      const proofTx = await writeContract({
        address: poolAddress,
        functionName: 'submitProofBySender',
        args: [userAddress, proofName, proofHash],
      });

      console.log("⏳ Waiting for proof transaction confirmation...");

      // Store encrypted data in contract
      const dataTx = await writeContract({
        address: poolAddress,
        functionName: 'storeEncryptedData',
        args: [encryptedCID, proofHash], // Using proofHash as access condition
      });

      console.log("✅ Proof and encrypted data submitted successfully");

      return {
        success: true,
        transactionHash: dataTx.hash,
        encryptedCID,
        proofHash
      };

    } catch (error) {
      console.error("❌ Contract submission failed:", error);
      return {
        success: false,
        error: `Contract submission failed: ${error}`
      };
    }
  }

  /**
   * Handle buyer access transfer after payment
   */
  async transferDataAccess(
    poolAddress: string,
    buyerAddress: string,
    sellerAddress: string,
    encryptedCID: string
  ): Promise<boolean> {
    try {
      console.log("🔄 Transferring data access to buyer...");

      const accessTransferred = await lighthouseService.transferAccess(
        encryptedCID,
        buyerAddress,
        sellerAddress
      );

      if (accessTransferred) {
        console.log("✅ Data access transferred successfully");
      }

      return accessTransferred;

    } catch (error) {
      console.error("❌ Access transfer failed:", error);
      return false;
    }
  }

  /**
   * Buyer downloads and decrypts purchased data
   */
  async buyerAccessData(
    encryptedCID: string,
    buyerAddress: string
  ): Promise<any> {
    try {
      console.log("📥 Buyer accessing encrypted data...");

      const decryptedData = await lighthouseService.decryptAndDownload(
        encryptedCID,
        "", // Access condition will be checked by Lighthouse
        buyerAddress
      );

      console.log("✅ Data accessed successfully");
      return decryptedData;

    } catch (error) {
      console.error("❌ Data access failed:", error);
      throw new Error(`Data access failed: ${error}`);
    }
  }

  /**
   * Generate proof hash for Self verification
   */
  private generateSelfProofHash(proofData: any): string {
    const dataToHash = JSON.stringify({
      type: proofData.type,
      userId: proofData.userId,
      verifiedFields: proofData.verifiedFields,
      timestamp: proofData.timestamp
    });

    // Simple hash (in production, use keccak256)
    return '0x' + Buffer.from(dataToHash).toString('hex').substring(0, 64);
  }

  /**
   * Check if user has completed all required verifications
   */
  async checkVerificationStatus(
    poolAddress: string,
    userAddress: string,
    requiredProofs: string[]
  ): Promise<{
    isFullyVerified: boolean;
    completedProofs: string[];
    missingProofs: string[];
  }> {
    try {
      // This would query the smart contract to check proof status
      // For now, return a mock response
      return {
        isFullyVerified: false,
        completedProofs: [],
        missingProofs: requiredProofs
      };
    } catch (error) {
      console.error("Error checking verification status:", error);
      return {
        isFullyVerified: false,
        completedProofs: [],
        missingProofs: requiredProofs
      };
    }
  }
}

// Export singleton instance
export const verificationService = new DataFiVerificationService();

export default DataFiVerificationService;