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
  redirectTo?: string; // Signal for UI redirect
  poolAddress?: string;
  poolCreatorAddress?: string;
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
      const signedMessage = await this.getSignedMessage(userAddress);
      const encryptionResult = await lighthouseService.encryptAndUpload(
        proofData,
        userAddress,
        signedMessage,
        "self-verification-data"
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
      // For service-level operations, we'll create a deterministic message
      // In components, you should use the useSignMessage hook directly
      const message = `Sign this message to authenticate with Lighthouse for DataFi verification.
Address: ${userAddress}
Timestamp: ${Date.now()}
Purpose: Data verification and encryption`;

      console.log("📝 Message prepared for signing:", message);
      console.log("⚠️ Use useSignMessage hook in components to get actual signature");

      // Return placeholder - components should use useSignMessage hook
      return `placeholder-signature-${userAddress}-${Date.now()}`;
    } catch (error) {
      console.error("Error preparing signed message:", error);
      throw new Error("Failed to prepare signed message for user");
    }
  }

  /**
   * Complete ZK Email verification flow with Lighthouse encryption
   */
  async processZKEmailVerification(
    poolAddress: string,
    userAddress: string,
    emlContent: string,
    verificationType: 'registry' | 'hackerhouse' | 'netflix' = 'registry',
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

      console.log("✅ ZK EMAIL VERIFICATION SUMMARY:");
      console.log("  Success:", true);
      console.log("  Lighthouse CID:", lighthouseCID);
      console.log("  Proof Hash:", proofHash);
      console.log("  Email From:", emailVerification.emailData.from);
      console.log("  Email Subject:", emailVerification.emailData.subject);
      console.log("  Verification Type:", verificationType);
      console.log("  Pool Creator Access:", poolCreatorAddress ? "✅ Granted" : "❌ Not provided");

      // Log data access information
      if (lighthouseCID) {
        console.log("📁 DATA ACCESS INFO:");
        console.log("  Storage URL:", `https://gateway.lighthouse.storage/ipfs/${lighthouseCID}`);
        console.log("  Owner:", userAddress);
        if (poolCreatorAddress) {
          console.log("  Pool Creator can access:", poolCreatorAddress);
          console.log("  Pool Creator access URL:", `https://gateway.lighthouse.storage/ipfs/${lighthouseCID}`);
        }
      }

      return {
        success: true,
        lighthouseCID,
        proofHash,
        redirectTo: 'pool-owner-dashboard', // Signal to redirect to dashboard
        poolAddress,
        poolCreatorAddress,
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
    encryptedCID: string,
    signedMessage: string
  ): Promise<boolean> {
    try {
      console.log("🔄 Transferring data access to buyer...");

      const accessTransferred = await lighthouseService.shareWithBuyers(
        encryptedCID,
        [buyerAddress],
        sellerAddress,
        signedMessage
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