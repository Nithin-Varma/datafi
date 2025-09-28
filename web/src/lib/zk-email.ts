// ZK Email verification with actual circuit support
// import { generateEmailVerifierInputs } from "@zk-email/helpers";

// Placeholder for actual ZK circuit blueprint
const ZK_CIRCUIT_BLUEPRINT = {
  // TODO: Replace with actual circuit blueprint
  // This will be the compiled circuit that verifies email authenticity
  circuit: null, // Will be loaded from your blueprint
  wasm: null,    // Circuit WASM file
  zkey: null,    // Proving key
  vkey: null     // Verification key
};

/**
 * Load ZK circuit blueprint (call this when you have your blueprint ready)
 * @param blueprint - Your ZK circuit blueprint
 */
export const loadZKBlueprint = async (blueprint: {
  wasm: string | ArrayBuffer;
  zkey: string | ArrayBuffer;
  vkey: string | ArrayBuffer;
}) => {
  ZK_CIRCUIT_BLUEPRINT.wasm = blueprint.wasm;
  ZK_CIRCUIT_BLUEPRINT.zkey = blueprint.zkey;
  ZK_CIRCUIT_BLUEPRINT.vkey = blueprint.vkey;
  ZK_CIRCUIT_BLUEPRINT.circuit = true; // Mark as loaded
  console.log("ZK circuit blueprint loaded successfully!");
};

// Mock implementation for development - replace with actual ZK circuit
const generateEmailVerifierInputs = async (emlContent: string, options: any) => {
  return {
    emailHeader: Buffer.from(emlContent.split('\n\n')[0]),
    emailBody: Buffer.from(emlContent.split('\n\n').slice(1).join('\n\n')),
    publicKey: Buffer.from('mock-public-key'),
    bodyHash: 'mock-body-hash-' + Date.now()
  };
};

export interface ZKEmailProof {
  proof: string;
  publicSignals: string[];
  emailHash: string;
  domainHash: string;
}

export interface EmailVerificationResult {
  isValid: boolean;
  proofHash: string;
  emailData: {
    from: string;
    to: string;
    subject: string;
    body: string;
    timestamp: string;
  };
  zkProof: ZKEmailProof;
  lighthouseCID?: string; // Lighthouse storage CID
}

class ZKEmailService {
  /**
   * Process and verify an EML file with specific verification parameters
   * @param emlContent - Raw EML file content as string
   * @param verificationType - Type of verification ('hackerhouse' or 'netflix')
   */
  async verifyEmail(
    emlContent: string,
    verificationType: 'hackerhouse' | 'netflix' = 'hackerhouse',
    userAddress?: string,
    signedMessage?: string,
    poolCreatorAddress?: string
  ): Promise<EmailVerificationResult> {
    const verificationParams = this.getVerificationParams(verificationType);

    try {
      // Parse EML content to extract email components
      console.log("EML content:", emlContent);
      const emailData = this.parseEMLContent(emlContent);
      console.log("Email data:", emailData);

      // MOCK VERIFICATION - Always return true for any .eml file
      console.log("🔧 MOCK MODE: Skipping domain and keyword validation");
      console.log("✅ Mock verification passed for any .eml file");

      // Generate ZK proof inputs
      const zkInputs = await generateEmailVerifierInputs(emlContent, {
        maxHeaderLength: 1024,
        maxBodyLength: 2048,
        ignoreBodyHashCheck: false
      });

      console.log("ZK inputs:", zkInputs);

      // Create a verification-specific proof hash
      const proofHash = this.generateProofHash(emailData, zkInputs, verificationType);

      // Simulate ZK proof generation (in production, this would call actual ZK circuits)
      // const zkProof: ZKEmailProof = {
      //   proof: this.generateMockProof(zkInputs),
      //   publicSignals: [
      //     zkInputs.emailHeader.toString(),
      //     zkInputs.emailBody.toString(),
      //     zkInputs.publicKey.toString()
      //   ],
      //   emailHash: zkInputs.bodyHash.toString(),
      //   domainHash: this.hashDomain(verificationParams.expectedDomains[0])
      // };

      // Generate actual ZK proof using circuit blueprint
      const proofString = await this.generateActualProof(zkInputs, verificationType);
      const zkProof: ZKEmailProof = {
        proof: proofString,
        publicSignals: [
          zkInputs.emailHeader.toString(),
          zkInputs.emailBody.toString(),
          zkInputs.publicKey.toString()
        ],
        emailHash: zkInputs.bodyHash.toString(),
        domainHash: this.hashDomain(verificationParams.expectedDomains[0])
      };

      // Store verification data to Lighthouse
      const verificationData = this.createVerificationData(emailData, zkProof, verificationType);
      
      if (!userAddress || !signedMessage) {
        throw new Error("User address and signed message are required for Lighthouse storage");
      }
      
      const lighthouseCID = await this.storeToLighthouse(verificationData, userAddress, signedMessage);
      
      // Share with pool creator if we have their address
      if (poolCreatorAddress) {
        await this.shareWithPoolCreator(lighthouseCID, poolCreatorAddress, userAddress, signedMessage);
      }

      return {
        isValid: true,
        proofHash,
        emailData,
        zkProof,
        lighthouseCID // Add Lighthouse CID for data storage
      };

    } catch (error) {
      console.error(`Error verifying ${verificationType} email:`, error);
      return {
        isValid: false,
        proofHash: "",
        emailData: {
          from: "",
          to: "",
          subject: "",
          body: "",
          timestamp: ""
        },
        zkProof: {
          proof: "",
          publicSignals: [],
          emailHash: "",
          domainHash: ""
        }
      };
    }
  }

  /**
   * Legacy method for backwards compatibility
   */
  async verifyHackerhouseEmail(
    emlContent: string,
    expectedDomain: string = 'arman@zk-verify.io',
    expectedKeywords: string[] = ['hackerhouse', 'invitation', 'ETH Delhi']
  ): Promise<EmailVerificationResult> {
    try {
      // Parse EML content to extract email components
      const emailData = this.parseEMLContent(emlContent);

      // MOCK VERIFICATION - Always return true for any .eml file
      console.log("🔧 MOCK MODE: Skipping domain and keyword validation");
      console.log("✅ Mock verification passed for any .eml file");

      // Generate ZK proof inputs
      const zkInputs = await generateEmailVerifierInputs(emlContent, {
        maxHeaderLength: 1024,
        maxBodyLength: 2048,
        ignoreBodyHashCheck: false
      });

      // Create a simplified proof hash for smart contract
      const proofHash = this.generateProofHash(emailData, zkInputs);

      // Simulate ZK proof generation (in production, this would call actual ZK circuits)
      // const zkProof: ZKEmailProof = {
      //   proof: this.generateMockProof(zkInputs),
      //   publicSignals: [
      //     zkInputs.emailHeader.toString(),
      //     zkInputs.emailBody.toString(),
      //     zkInputs.publicKey.toString()
      //   ],
      //   emailHash: zkInputs.bodyHash.toString(),
      //   domainHash: this.hashDomain(expectedDomain)
      // };


      return {
        isValid: true,
        proofHash,
        emailData,
        zkProof: {
          proof: "",
          publicSignals: [],
          emailHash: "",
          domainHash: ""
        }
      };

    } catch (error) {
      console.error("Error verifying hackerhouse email:", error);
      return {
        isValid: false,
        proofHash: "",
        emailData: {
          from: "",
          to: "",
          subject: "",
          body: "",
          timestamp: ""
        },
        zkProof: {
          proof: "",
          publicSignals: [],
          emailHash: "",
          domainHash: ""
        }
      };
    }
  }

  /**
   * Parse EML file content to extract email metadata
   * @param emlContent - Raw EML content
   */
  private parseEMLContent(emlContent: string) {
    const lines = emlContent.split('\n');
    let from = '';
    let to = '';
    let subject = '';
    let date = '';
    let body = '';
    let inBody = false;

    for (const line of lines) {
      if (!inBody) {
        if (line.startsWith('From:')) {
          from = line.substring(5).trim();
        } else if (line.startsWith('To:')) {
          to = line.substring(3).trim();
        } else if (line.startsWith('Subject:')) {
          subject = line.substring(8).trim();
        } else if (line.startsWith('Date:')) {
          date = line.substring(5).trim();
        } else if (line.trim() === '') {
          inBody = true;
        }
      } else {
        body += line + '\n';
      }
    }

    return {
      from: this.cleanEmailAddress(from),
      to: this.cleanEmailAddress(to),
      subject,
      body: body.trim(),
      timestamp: date
    };
  }

  /**
   * Clean email address from headers
   * @param emailHeader - Raw email header
   */
  private cleanEmailAddress(emailHeader: string): string {
    const emailMatch = emailHeader.match(/<([^>]+)>/);
    return emailMatch ? emailMatch[1] : emailHeader.trim();
  }

  /**
   * Get verification parameters based on type
   * @param verificationType - Type of verification
   */
  private getVerificationParams(verificationType: 'hackerhouse' | 'netflix') {
    switch (verificationType) {
      case 'hackerhouse':
        return {
          expectedDomains: ['arman@zk-verify.io', 'ethglobal.com', 'hackerhouse.com'],
          expectedKeywords: ['hackerhouse', 'invitation', 'ETH Delhi', 'selected', 'participant']
        };
      case 'netflix':
        return {
          expectedDomains: ['netflix.com', 'info@netflix.com', 'noreply@netflix.com'],
          expectedKeywords: ['netflix', 'subscription', 'billing', 'payment', 'plan', 'premium']
        };
      default:
        return {
          expectedDomains: ['devfolio.co'],
          expectedKeywords: ['hackerhouse', 'invitation']
        };
    }
  }

  /**
   * Validate if email is from expected domain
   * @param fromField - Email from field
   * @param expectedDomains - Array of expected domains
   */
  private validateDomain(fromField: string, expectedDomains: string[]): boolean {
    return expectedDomains.some(domain => fromField.toLowerCase().includes(domain.toLowerCase()));
  }

  /**
   * Generate a unique proof hash for the email
   * @param emailData - Parsed email data
   * @param zkInputs - ZK inputs
   * @param verificationType - Type of verification
   */
  private generateProofHash(emailData: any, zkInputs: any, verificationType?: string): string {
    const dataToHash = JSON.stringify({
      from: emailData?.from || 'unknown@example.com',
      subject: emailData?.subject || 'No Subject',
      bodyHash: zkInputs?.bodyHash?.toString() || 'mock-body-hash',
      timestamp: emailData?.timestamp || Date.now(),
      verificationType: verificationType || 'default'
    });

    // Simple hash function (in production, use keccak256 or similar)
    return '0x' + Buffer.from(dataToHash).toString('hex').substring(0, 64);
  }

  /**
   * Hash domain name for verification
   * @param domain - Domain to hash
   */
  private hashDomain(domain: string): string {
    return '0x' + Buffer.from(domain).toString('hex').padStart(64, '0');
  }

  /**
   * Generate actual ZK proof using circuit blueprint
   * @param zkInputs - ZK inputs
   * @param verificationType - Type of verification
   */
  private async generateActualProof(zkInputs: any, verificationType: string): Promise<string> {
    try {
      // TODO: Replace with actual ZK circuit proof generation
      // This is where you'll integrate your blueprint
      
      if (!ZK_CIRCUIT_BLUEPRINT.circuit) {
        console.warn("ZK circuit blueprint not loaded, using mock proof");
        return this.generateMockProof(zkInputs);
      }

      // Actual ZK proof generation would go here:
      // 1. Load circuit from blueprint
      // 2. Generate witness
      // 3. Create proof using snarkjs or similar
      // 4. Return proof as JSON string

      // For now, return mock proof until blueprint is integrated
      return this.generateMockProof(zkInputs);
      
    } catch (error) {
      console.error("Error generating ZK proof:", error);
      // Fallback to mock proof
      return this.generateMockProof(zkInputs);
    }
  }

  /**
   * Generate mock ZK proof (fallback when circuit not available)
   * @param zkInputs - ZK inputs
   */
  private generateMockProof(zkInputs: any): string {
    const mockProof = {
      a: ["0x" + Math.random().toString(16).substring(2, 66)],
      b: [["0x" + Math.random().toString(16).substring(2, 66), "0x" + Math.random().toString(16).substring(2, 66)]],
      c: ["0x" + Math.random().toString(16).substring(2, 66)]
    };
    return JSON.stringify(mockProof);
  }

  /**
   * Verify ZK proof (would interact with actual verifier contract)
   * @param proof - ZK proof to verify
   * @param publicSignals - Public signals for verification
   */
  async verifyProof(proof: string, publicSignals: string[]): Promise<boolean> {
    try {
      // In production, this would call a ZK verifier contract
      // For now, we'll do basic validation
      const parsedProof = JSON.parse(proof);
      return !!(parsedProof.a && parsedProof.b && parsedProof.c && publicSignals.length > 0);
    } catch (error) {
      console.error("Error verifying ZK proof:", error);
      return false;
    }
  }

  /**
   * Store verification data to Lighthouse
   * @param verificationData - Verification data to store
   * @param userAddress - User's wallet address
   * @param signedMessage - User's signed message
   */
  private async storeToLighthouse(verificationData: any, userAddress: string, signedMessage: string): Promise<string> {
    try {
      console.log("🔐 Encrypting and storing data to Lighthouse...");
      
      // Import Lighthouse SDK
      const lighthouse = await import('@lighthouse-web3/sdk');
      
      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
      if (!apiKey) {
        throw new Error("Lighthouse API key not found in environment variables");
      }
      
      // Convert verification data to JSON string
      const dataString = JSON.stringify(verificationData);
      
      // Use real user address and signed message
      const publicKey = userAddress;
      
      // Upload encrypted data to Lighthouse
      const response = await lighthouse.textUploadEncrypted(
        dataString,
        apiKey,
        publicKey,
        signedMessage,
        "email-verification-data"
      );
      
      console.log("✅ Data encrypted and stored to Lighthouse with CID:", response.data.Hash);
      return response.data.Hash;
      
    } catch (error) {
      console.error("Error storing to Lighthouse:", error);
      throw new Error(`Failed to store data to Lighthouse: ${error}`);
    }
  }

  /**
   * Share encrypted file with pool creator
   * @param cid - CID of the encrypted file
   * @param poolCreatorAddress - Address of the pool creator
   * @param userAddress - User's wallet address
   * @param signedMessage - User's signed message
   */
  private async shareWithPoolCreator(cid: string, poolCreatorAddress: string, userAddress: string, signedMessage: string): Promise<void> {
    try {
      console.log("👯 Sharing encrypted file with pool creator:", poolCreatorAddress);
      
      // Import Lighthouse SDK
      const lighthouse = await import('@lighthouse-web3/sdk');
      
      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
      if (!apiKey) {
        throw new Error("Lighthouse API key not found in environment variables");
      }
      
      // Use real user address and signed message
      const publicKey = userAddress;
      
      // Share file with pool creator
      const shareResponse = await lighthouse.shareFile(
        publicKey,
        [poolCreatorAddress],
        cid,
        signedMessage
      );
      
      console.log("✅ File shared with pool creator:", shareResponse);
      
    } catch (error) {
      console.error("Error sharing file with pool creator:", error);
      throw new Error(`Failed to share file with pool creator: ${error}`);
    }
  }

  /**
   * Create email verification data for Lighthouse encryption
   * @param emailData - Parsed email data
   * @param zkProof - Generated ZK proof
   */
  createVerificationData(emailData: any, zkProof: ZKEmailProof, verificationType?: string) {
    return {
      type: `${verificationType || 'hackerhouse'}_email_verification`,
      timestamp: new Date().toISOString(),
      emailMetadata: {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        timestamp: emailData.timestamp
      },
      verification: {
        domain: emailData.from.split('@')[1],
        zkProof: zkProof,
        verifiedAt: new Date().toISOString()
      },
      proof: {
        hash: this.generateProofHash(emailData, { bodyHash: 'mock-hash' }, verificationType),
        isValid: true
      }
    };
  }
}

// Create singleton instance
export const zkEmailService = new ZKEmailService();

export default ZKEmailService;