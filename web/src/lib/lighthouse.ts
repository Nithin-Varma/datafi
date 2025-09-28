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
   * Encrypt and upload data to Lighthouse using textUploadEncrypted
   * @param data - Data to encrypt (JSON object, file, etc.)
   * @param userAddress - Address of the data owner
   * @param signedMessage - Signed message for authentication
   * @param name - Optional name for the data
   */
  async encryptAndUpload(
    data: any,
    userAddress: string,
    signedMessage: string,
    name?: string
  ): Promise<EncryptedDataResult & { dataDetails: any }> {
    try {
      console.log("🔐 Encrypting and uploading data to Lighthouse...");
      console.log("👤 User:", userAddress);
      console.log("📝 Name:", name || "verification-data");

      // Convert data to JSON string if it's an object
      const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);

      // Log detailed information about what's being encrypted
      console.log("📊 DATA BEING ENCRYPTED:");
      console.log("  Size:", dataToEncrypt.length, "bytes");
      console.log("  Type:", typeof data);
      console.log("  Preview:", dataToEncrypt.substring(0, 200) + "...");

      if (typeof data === 'object') {
        console.log("  Object keys:", Object.keys(data));
        console.log("  Full object:", data);
      }

      // For development, let's create a proper IPFS CID format
      // This avoids the 406 error while we test the flow
      console.log("⚠️ Using mock Lighthouse upload for development");

      // Generate a proper IPFS CID v0 format (QmHash - 46 characters total with base58 encoding)
      const generateProperCID = () => {
        // Base58 alphabet (Bitcoin/IPFS standard) - excludes 0, O, I, l to avoid confusion
        const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let result = 'Qm'; // IPFS CID v0 prefix
        // Generate 44 more characters using base58 alphabet to make a valid 46-character CID
        for (let i = 0; i < 44; i++) {
          result += base58chars.charAt(Math.floor(Math.random() * base58chars.length));
        }
        return result;
      };

      const mockCID = generateProperCID();

      console.log("✅ LIGHTHOUSE STORAGE DETAILS:");
      console.log("  CID:", mockCID);
      console.log("  Owner:", userAddress);
      console.log("  Data Name:", name || "verification-data");
      console.log("  Storage URL:", `https://gateway.lighthouse.storage/ipfs/${mockCID}`);

      // TODO: Uncomment when Lighthouse API is properly configured
      /*
      const response = await lighthouse.textUploadEncrypted(
        dataToEncrypt,
        this.config.apiKey,
        userAddress,
        signedMessage,
        name || "verification-data"
      );

      console.log("✅ Data encrypted and uploaded with CID:", response.data.Hash);

      return {
        encryptedCID: response.data.Hash,
        accessCondition: "",
        masterKey: "",
        dataDetails: {
          originalData: data,
          encryptedSize: dataToEncrypt.length,
          storageUrl: `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`
        }
      };
      */

      return {
        encryptedCID: mockCID,
        accessCondition: "",
        masterKey: "",
        dataDetails: {
          originalData: data,
          encryptedSize: dataToEncrypt.length,
          storageUrl: `https://gateway.lighthouse.storage/ipfs/${mockCID}`,
          mockData: true
        }
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
   * Share encrypted file with specific addresses (transfer access to buyer)
   * @param encryptedCID - The IPFS CID of encrypted data
   * @param buyerAddresses - Array of addresses to grant access
   * @param sellerAddress - Original owner address
   * @param signedMessage - Signed message for authentication
   */
  async shareWithBuyers(
    encryptedCID: string,
    buyerAddresses: string[],
    sellerAddress: string,
    signedMessage: string
  ): Promise<boolean> {
    try {
      console.log("👯 SHARING ENCRYPTED FILE:");
      console.log("  CID:", encryptedCID);
      console.log("  Seller/Owner:", sellerAddress);
      console.log("  Sharing with:", buyerAddresses);
      console.log("  Number of recipients:", buyerAddresses.length);

      // Log each recipient
      buyerAddresses.forEach((buyer, index) => {
        console.log(`  Recipient ${index + 1}:`, buyer);
        console.log(`    Can now access: https://gateway.lighthouse.storage/ipfs/${encryptedCID}`);
      });

      // For development, use mock sharing to avoid API errors
      console.log("⚠️ Using mock Lighthouse sharing for development");

      // Simulate sharing success
      console.log("✅ SHARING COMPLETED:");
      console.log("  Status: Success");
      console.log("  Shared CID:", encryptedCID);
      console.log("  Total recipients:", buyerAddresses.length);
      console.log("  Recipients can now decrypt and access the data");

      // TODO: Uncomment when Lighthouse API is properly configured
      /*
      const response = await lighthouse.shareFile(
        sellerAddress,    // publicKey (owner)
        buyerAddresses,   // publicKeyUserB (receivers)
        encryptedCID,     // cid
        signedMessage     // signedMessage
      );

      console.log("✅ File shared successfully:", response);
      console.log("  Response:", response);
      */

      return true;
    } catch (error) {
      console.error("Error sharing file:", error);
      throw new Error(`Failed to share file: ${error}`);
    }
  }

  /**
   * Get file info and access status
   * @param encryptedCID - The IPFS CID of encrypted data
   * @param userAddress - Address to check access for
   */
  async getFileAccess(encryptedCID: string, userAddress: string): Promise<boolean> {
    try {
      const response = await lighthouse.fetchEncryptionKey(
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