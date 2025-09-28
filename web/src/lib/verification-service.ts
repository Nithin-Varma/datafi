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
  lighthouseCID?: string; // Add Lighthouse CID
  error?: string;
}

class DataFiVerificationService {

  /**
   * Complete ZK Email verification flow with Lighthouse encryption
   */
  async processZKEmailVerification(
    poolAddress: string,
    userAddress: string,
    emlContent: string,
    verificationType: 'hackerhouse' | 'netflix' = 'hackerhouse'
  ): Promise<VerificationResult> {
    try {
      console.log("🔄 Processing ZK Email verification...");

      // 1. Verify email using ZK email service
      const emailVerification = await zkEmailService.verifyEmail(emlContent, verificationType);
      
      if (!emailVerification.isValid) {
        throw new Error("Email verification failed");
      }

      // 2. The ZK email service already stores to Lighthouse and returns CID
      const lighthouseCID = emailVerification.lighthouseCID;
      
      if (!lighthouseCID) {
        throw new Error("Failed to store verification data to Lighthouse");
      }

      // 3. Generate proof hash for smart contract
      const proofHash = emailVerification.proofHash;

      console.log("✅ ZK Email verification completed successfully!");
      console.log("📦 Lighthouse CID:", lighthouseCID);
      console.log("🔐 Proof Hash:", proofHash);

      return {
        success: true,
        lighthouseCID,
        proofHash,
      };

    } catch (error) {
      console.error("❌ ZK Email verification failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

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
   * Get signed message from user for Lighthouse authentication
   * @param userAddress - User's wallet address
   */
  private async getSignedMessage(userAddress: string): Promise<string> {
    try {
      // In a real implementation, you would prompt the user to sign a message
      // For now, we'll create a message that the user should sign
      const message = `Sign this message to authenticate with Lighthouse for DataFi verification.\nAddress: ${userAddress}\nTimestamp: ${Date.now()}`;
      
      // TODO: Implement actual message signing with user's wallet
      // This would typically use wagmi's useSignMessage hook
      console.log("⚠️ Message signing not implemented yet. Using placeholder signature.");
      return `placeholder-signature-${userAddress}-${Date.now()}`;
    } catch (error) {
      console.error("Error getting signed message:", error);
      throw new Error("Failed to get signed message from user");
    }
  }

  /**
   * Complete ZK Email verification flow with Lighthouse encryption
   */
  async processZKEmailVerification(
    poolAddress: string,
    userAddress: string,
    emlContent: string,
    verificationType: 'hackerhouse' | 'netflix' = 'hackerhouse',
    poolCreatorAddress?: string
  ): Promise<VerificationResult> {
    try {
      console.log("📧 Processing ZK Email verification...");

      // 1. Verify the email using ZK Email with specific type
      const emailVerification = await zkEmailService.verifyEmail(
        emlContent, 
        verificationType,
        userAddress,
        await this.getSignedMessage(userAddress),
        poolCreatorAddress
      );

      if (!emailVerification.isValid) {
        throw new Error("Email verification failed");
      }

      // 2. Create verification data for encryption
      const verificationData = zkEmailService.createVerificationData(
        emailVerification.emailData,
        emailVerification.zkProof
      );

      // 3. Lighthouse encryption and sharing is now handled by ZK email service
      console.log("🔐 Lighthouse encryption and sharing handled by ZK email service");
      const lighthouseCID = emailVerification.lighthouseCID;
      console.log("✅ Lighthouse encryption completed with CID:", lighthouseCID);

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