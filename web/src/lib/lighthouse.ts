import { generate, saveShards, recoverKey } from "@lighthouse-web3/kavach";
import lighthouse from "@lighthouse-web3/sdk";

export interface EncryptedDataResult {
  encryptedCID: string;
  accessCondition: string;
  masterKey: string;
}

export interface LighthouseConfig {
  apiKey: string;
  network: string;
}

class LighthouseService {
  private config: LighthouseConfig;

  constructor(config: LighthouseConfig) {
    this.config = config;
  }

  /**
   * Encrypt and upload data to Lighthouse with access control
   * @param data - Data to encrypt (JSON object, file, etc.)
   * @param poolAddress - Smart contract address for access control
   * @param sellerAddress - Address of the data seller
   * @param buyerAddress - Address of the data buyer
   */
  async encryptAndUpload(
    data: any,
    poolAddress: string,
    sellerAddress: string,
    buyerAddress: string
  ): Promise<EncryptedDataResult> {
    try {
      // Generate encryption keys using Kavach
      const { masterKey, keyShards } = await generate();

      // Create access control conditions
      // Either the seller owns the data OR the buyer has purchased access
      const accessCondition = {
        id: 1,
        chain: "base_sepolia", // or your preferred chain
        method: "OR",
        standardContractType: "",
        contractAddress: poolAddress,
        returnValueTest: {
          comparator: ">=",
          value: "1"
        },
        parameters: [sellerAddress, buyerAddress],
        inputArrayType: ["address", "address"],
        outputType: "bool"
      };

      // Convert data to JSON string if it's an object
      const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);

      // Create a blob from the data
      const blob = new Blob([dataToEncrypt], { type: 'application/json' });
      const file = new File([blob], 'encrypted_data.json', { type: 'application/json' });

      // Upload encrypted file to Lighthouse
      const uploadResponse = await lighthouse.uploadEncrypted(
        [file],
        this.config.apiKey,
        sellerAddress, // owner address
        JSON.stringify([accessCondition])
      );

      // Save key shards for decryption (in production, these should be distributed)
      await saveShards(keyShards);

      return {
        encryptedCID: uploadResponse.data.Hash,
        accessCondition: JSON.stringify(accessCondition),
        masterKey
      };
    } catch (error) {
      console.error("Error encrypting and uploading data:", error);
      throw new Error(`Failed to encrypt and upload data: ${error}`);
    }
  }

  /**
   * Decrypt and download data from Lighthouse
   * @param encryptedCID - The IPFS CID of encrypted data
   * @param accessCondition - Access control condition
   * @param userAddress - Address requesting access
   */
  async decryptAndDownload(
    encryptedCID: string,
    accessCondition: string,
    userAddress: string
  ): Promise<any> {
    try {
      // Check access conditions (this should be done by Lighthouse)
      const decrypted = await lighthouse.decryptFile(
        encryptedCID,
        userAddress,
        this.config.apiKey
      );

      // Parse the decrypted data
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Error decrypting data:", error);
      throw new Error(`Failed to decrypt data: ${error}`);
    }
  }

  /**
   * Transfer access to buyer by updating access conditions
   * @param encryptedCID - The IPFS CID of encrypted data
   * @param buyerAddress - New address to grant access
   * @param sellerAddress - Original owner address
   */
  async transferAccess(
    encryptedCID: string,
    buyerAddress: string,
    sellerAddress: string
  ): Promise<boolean> {
    try {
      // Update access conditions to include the buyer
      const response = await lighthouse.shareFile(
        sellerAddress,
        [buyerAddress],
        encryptedCID,
        this.config.apiKey
      );

      return response.data.success;
    } catch (error) {
      console.error("Error transferring access:", error);
      throw new Error(`Failed to transfer access: ${error}`);
    }
  }

  /**
   * Get file info and access status
   * @param encryptedCID - The IPFS CID of encrypted data
   * @param userAddress - Address to check access for
   */
  async getFileAccess(encryptedCID: string, userAddress: string): Promise<boolean> {
    try {
      const response = await lighthouse.getFileEncryptionKey(
        encryptedCID,
        userAddress,
        this.config.apiKey
      );

      return !!response.data.key;
    } catch (error) {
      console.error("Error checking file access:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const lighthouseService = new LighthouseService({
  apiKey: process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "",
  network: process.env.NEXT_PUBLIC_NETWORK || "base_sepolia"
});

export default LighthouseService;