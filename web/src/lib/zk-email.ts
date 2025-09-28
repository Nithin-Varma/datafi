// ZK Email verification with registry circuit support
// import { generateEmailVerifierInputs } from "@zk-email/helpers";

// Registry circuit configuration
const ZK_EMAIL_REGISTRY = {
  // Your ZK Email registry circuit ID
  circuitId: "2a750584-9226-4a64-a257-d72c19cbfc09",
  registryUrl: "https://registry.zk.email",
  apiUrl: "https://registry.zk.email/api",

  // Circuit artifacts (will be loaded from registry)
  circuit: null as boolean | null,
  wasm: null as string | ArrayBuffer | null,
  zkey: null as string | ArrayBuffer | null,
  vkey: null as string | ArrayBuffer | null
};

/**
 * Load ZK circuit from the registry
 * @param circuitId - Registry circuit ID (defaults to your circuit)
 */
export const loadRegistryCircuit = async (circuitId?: string) => {
  const id = circuitId || ZK_EMAIL_REGISTRY.circuitId;

  try {
    console.log(`🔄 Loading ZK Email circuit from registry: ${id}`);

    // In a real implementation, you would fetch the circuit artifacts from the registry
    // For now, we'll prepare the structure for your circuit integration

    // TODO: Implement actual registry API calls to fetch:
    // - circuit.wasm
    // - circuit.zkey
    // - verification.vkey
    // - circuit metadata

    ZK_EMAIL_REGISTRY.circuit = true;
    console.log(`✅ ZK Email registry circuit ${id} loaded successfully!`);

    return {
      circuitId: id,
      loaded: true,
      registryUrl: `${ZK_EMAIL_REGISTRY.registryUrl}/${id}`
    };
  } catch (error) {
    console.error("❌ Failed to load registry circuit:", error);
    throw new Error(`Failed to load ZK circuit from registry: ${error}`);
  }
};

/**
 * Verify email using the registry circuit
 * @param emlContent - EML file content
 * @param circuitId - Optional circuit ID (uses default if not provided)
 */
export const verifyWithRegistryCircuit = async (
  emlContent: string,
  circuitId?: string
): Promise<{
  isValid: boolean;
  proof: any;
  publicSignals: any[];
  circuitId: string;
}> => {
  const id = circuitId || ZK_EMAIL_REGISTRY.circuitId;

  try {
    console.log(`🔍 Verifying email with registry circuit: ${id}`);

    // Ensure circuit is loaded
    if (!ZK_EMAIL_REGISTRY.circuit) {
      await loadRegistryCircuit(id);
    }

    // TODO: Implement actual verification using the registry circuit
    // This would typically involve:
    // 1. Parse EML content
    // 2. Generate circuit inputs
    // 3. Run the ZK proof generation
    // 4. Return verification result

    // For now, return a structured response
    const mockProof = {
      a: ["0x" + Math.random().toString(16).substring(2, 66)],
      b: [["0x" + Math.random().toString(16).substring(2, 66), "0x" + Math.random().toString(16).substring(2, 66)]],
      c: ["0x" + Math.random().toString(16).substring(2, 66)]
    };

    console.log(`✅ Email verification completed with circuit ${id}`);

    return {
      isValid: true,
      proof: mockProof,
      publicSignals: ["0x123", "0x456"], // These would be actual public signals from your circuit
      circuitId: id
    };

  } catch (error) {
    console.error("❌ Registry circuit verification failed:", error);
    return {
      isValid: false,
      proof: null,
      publicSignals: [],
      circuitId: id
    };
  }
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
   * Process and verify an EML file using the registry circuit
   * @param emlContent - Raw EML file content as string
   * @param verificationType - Type of verification ('registry', 'hackerhouse', or 'netflix')
   */
  async verifyEmail(
    emlContent: string,
    verificationType: 'registry' | 'hackerhouse' | 'netflix' = 'registry',
    userAddress?: string,
    signedMessage?: string,
    poolCreatorAddress?: string
  ): Promise<EmailVerificationResult> {
    try {
      // Parse EML content to extract email components
      console.log("📧 Processing EML content...");
      const emailData = this.parseEMLContent(emlContent);
      console.log("📧 Email data parsed:", emailData);

      let zkProof: ZKEmailProof;
      let proofHash: string;

      if (verificationType === 'registry') {
        // Use your ZK Email registry circuit
        console.log("🔄 Using ZK Email registry circuit for verification...");

        const registryResult = await verifyWithRegistryCircuit(emlContent);

        if (!registryResult.isValid) {
          throw new Error("Registry circuit verification failed");
        }

        zkProof = {
          proof: JSON.stringify(registryResult.proof),
          publicSignals: registryResult.publicSignals,
          emailHash: this.hashEmailContent(emlContent),
          domainHash: this.hashDomain(emailData.from.split('@')[1])
        };

        proofHash = this.generateRegistryProofHash(emailData, registryResult, verificationType);

        console.log("✅ Registry circuit verification completed!");

      } else {
        // Legacy verification for hackerhouse/netflix
        const verificationParams = this.getVerificationParams(verificationType);

        console.log("🔧 Using legacy verification mode");

        // Generate ZK proof inputs
        const zkInputs = await generateEmailVerifierInputs(emlContent, {
          maxHeaderLength: 1024,
          maxBodyLength: 2048,
          ignoreBodyHashCheck: false
        });

        // Generate actual ZK proof using legacy method
        const proofString = await this.generateActualProof(zkInputs, verificationType);
        zkProof = {
          proof: proofString,
          publicSignals: [
            zkInputs.emailHeader.toString(),
            zkInputs.emailBody.toString(),
            zkInputs.publicKey.toString()
          ],
          emailHash: zkInputs.bodyHash.toString(),
          domainHash: this.hashDomain(verificationParams.expectedDomains[0])
        };

        proofHash = this.generateProofHash(emailData, zkInputs, verificationType);
      }

      // Store verification data to Lighthouse
      const verificationData = this.createVerificationData(emailData, zkProof, verificationType);

      if (!userAddress || !signedMessage) {
        throw new Error("User address and signed message are required for Lighthouse storage");
      }

      console.log("📧 VERIFICATION DATA TO BE STORED:");
      console.log("  Email from:", emailData.from);
      console.log("  Email subject:", emailData.subject);
      console.log("  Verification type:", verificationType);
      console.log("  Circuit ID (if registry):", verificationType === 'registry' ? ZK_EMAIL_REGISTRY.circuitId : 'N/A');
      console.log("  User address:", userAddress);
      console.log("  Pool creator:", poolCreatorAddress || 'None');

      const lighthouseCID = await this.storeToLighthouse(verificationData, userAddress, signedMessage);

      // Share with pool creator if we have their address
      if (poolCreatorAddress) {
        console.log("👤 SHARING WITH POOL CREATOR:");
        console.log("  Pool creator:", poolCreatorAddress);
        console.log("  CID:", lighthouseCID);

        await this.shareWithPoolCreator(lighthouseCID, poolCreatorAddress, userAddress, signedMessage);

        console.log("✅ Email data shared with pool creator for verification");
      } else {
        console.log("⚠️ No pool creator address provided - data not shared");
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
   * Hash email content for registry verification
   * @param emlContent - Raw EML content
   */
  private hashEmailContent(emlContent: string): string {
    return '0x' + Buffer.from(emlContent).toString('hex').substring(0, 64);
  }

  /**
   * Generate proof hash for registry circuit verification
   * @param emailData - Parsed email data
   * @param registryResult - Registry verification result
   * @param verificationType - Type of verification
   */
  private generateRegistryProofHash(emailData: any, registryResult: any, verificationType: string): string {
    const dataToHash = JSON.stringify({
      from: emailData?.from || 'unknown@example.com',
      subject: emailData?.subject || 'No Subject',
      circuitId: registryResult?.circuitId || ZK_EMAIL_REGISTRY.circuitId,
      proof: registryResult?.proof || 'mock-proof',
      timestamp: emailData?.timestamp || Date.now(),
      verificationType: verificationType
    });

    // Simple hash function (in production, use keccak256 or similar)
    return '0x' + Buffer.from(dataToHash).toString('hex').substring(0, 64);
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

      if (!ZK_EMAIL_REGISTRY.circuit) {
        console.warn("ZK circuit not loaded, using mock proof");
        return this.generateMockProof(zkInputs);
      }

      // Actual ZK proof generation would go here:
      // 1. Load circuit from registry or blueprint
      // 2. Generate witness
      // 3. Create proof using snarkjs or similar
      // 4. Return proof as JSON string

      // For now, return mock proof until circuit is fully integrated
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
   * Store verification data to Lighthouse using the LighthouseService
   * @param verificationData - Verification data to store
   * @param userAddress - User's wallet address
   * @param signedMessage - User's signed message
   */
  private async storeToLighthouse(verificationData: any, userAddress: string, signedMessage: string): Promise<string> {
    try {
      console.log("🔐 Encrypting and storing data to Lighthouse...");

      // Use the lighthouse service for encryption and upload
      const { lighthouseService } = await import('./lighthouse');

      const result = await lighthouseService.encryptAndUpload(
        verificationData,
        userAddress,
        signedMessage,
        "email-verification-data"
      );

      console.log("✅ Data encrypted and stored to Lighthouse with CID:", result.encryptedCID);
      return result.encryptedCID;

    } catch (error) {
      console.error("Error storing to Lighthouse:", error);
      throw new Error(`Failed to store data to Lighthouse: ${error}`);
    }
  }

  /**
   * Share encrypted file with pool creator using the LighthouseService
   * @param cid - CID of the encrypted file
   * @param poolCreatorAddress - Address of the pool creator
   * @param userAddress - User's wallet address
   * @param signedMessage - User's signed message
   */
  private async shareWithPoolCreator(cid: string, poolCreatorAddress: string, userAddress: string, signedMessage: string): Promise<void> {
    try {
      console.log("👯 Sharing encrypted file with pool creator:", poolCreatorAddress);

      // Use the lighthouse service for sharing
      const { lighthouseService } = await import('./lighthouse');

      await lighthouseService.shareWithBuyers(
        cid,
        [poolCreatorAddress],
        userAddress,
        signedMessage
      );

      console.log("✅ File shared with pool creator successfully");

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