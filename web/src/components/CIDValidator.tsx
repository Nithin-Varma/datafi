"use client";

import React, { useState } from 'react';

interface CIDValidatorProps {
  cid: string;
  onValidCID?: (cid: string) => void;
}

/**
 * Component to validate IPFS CIDs and provide helpful error messages
 */
export default function CIDValidator({ cid, onValidCID }: CIDValidatorProps) {
  const [validationResult, setValidationResult] = useState<any>(null);

  // Validate IPFS CID format
  const validateCID = (cidToValidate: string) => {
    const result = {
      isValid: false,
      format: 'unknown',
      errors: [] as string[],
      suggestions: [] as string[],
      correctedCID: null as string | null,
      accessUrls: [] as string[]
    };

    // Check if it's empty
    if (!cidToValidate || cidToValidate.trim() === '') {
      result.errors.push('CID is empty');
      result.suggestions.push('Please provide a valid IPFS CID');
      return result;
    }

    const trimmedCID = cidToValidate.trim();

    // Check CID v0 format (Qm...)
    if (trimmedCID.startsWith('Qm')) {
      if (trimmedCID.length === 46) {
        // Check if it uses valid base58 characters
        const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const isValidBase58 = trimmedCID.slice(2).split('').every(char => base58chars.includes(char));

        if (isValidBase58) {
          result.isValid = true;
          result.format = 'CIDv0 (Base58)';
          result.accessUrls = [
            `https://ipfs.io/ipfs/${trimmedCID}`,
            `https://gateway.lighthouse.storage/ipfs/${trimmedCID}`,
            `https://cloudflare-ipfs.com/ipfs/${trimmedCID}`,
            `https://gateway.pinata.cloud/ipfs/${trimmedCID}`
          ];
        } else {
          result.errors.push('Invalid characters in CID v0 - must use base58 encoding');
          result.suggestions.push('CID v0 must only contain base58 characters (excludes 0, O, I, l)');
        }
      } else {
        result.errors.push(`Invalid CID v0 length: ${trimmedCID.length} (should be 46 characters)`);
        result.suggestions.push('CID v0 should start with "Qm" and be exactly 46 characters long');
      }
    }
    // Check CID v1 format (bafy...)
    else if (trimmedCID.startsWith('bafy') || trimmedCID.startsWith('bafk')) {
      if (trimmedCID.length >= 59) {
        result.isValid = true;
        result.format = 'CIDv1 (Base32)';
        result.accessUrls = [
          `https://ipfs.io/ipfs/${trimmedCID}`,
          `https://gateway.lighthouse.storage/ipfs/${trimmedCID}`,
          `https://cloudflare-ipfs.com/ipfs/${trimmedCID}`,
          `https://gateway.pinata.cloud/ipfs/${trimmedCID}`
        ];
      } else {
        result.errors.push(`Invalid CID v1 length: ${trimmedCID.length} (should be at least 59 characters)`);
        result.suggestions.push('CID v1 should start with "bafy" or "bafk" and be at least 59 characters long');
      }
    }
    // Invalid format
    else {
      result.errors.push('Invalid CID format');
      result.suggestions.push('CID should start with "Qm" (v0) or "bafy"/"bafk" (v1)');

      // Try to suggest a correction for common issues
      if (trimmedCID.startsWith('Qm')) {
        const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

        // Fix both length and invalid character issues
        const generateValidCID = () => {
          let result = 'Qm';

          // First, fix any existing characters that are invalid
          for (let i = 2; i < trimmedCID.length; i++) {
            const char = trimmedCID[i];
            if (base58chars.includes(char)) {
              result += char;
            } else {
              // Replace invalid characters (0, O, I, l) with similar valid ones
              let replacement;
              switch (char) {
                case '0': replacement = '1'; break; // Replace 0 with 1
                case 'O': replacement = 'P'; break; // Replace O with P
                case 'I': replacement = 'J'; break; // Replace I with J
                case 'l': replacement = 'k'; break; // Replace l with k
                default: replacement = base58chars.charAt(Math.floor(Math.random() * base58chars.length));
              }
              result += replacement;
            }
          }

          // Then pad to 46 characters if needed
          while (result.length < 46) {
            result += base58chars.charAt(Math.floor(Math.random() * base58chars.length));
          }

          return result;
        };

        result.correctedCID = generateValidCID();

        if (trimmedCID.length < 46) {
          result.suggestions.push(`Your CID is too short (${trimmedCID.length} chars). Valid CID v0 needs 46 characters.`);
        }

        // Check for invalid characters
        const invalidChars = trimmedCID.slice(2).split('').filter(char => !base58chars.includes(char));
        if (invalidChars.length > 0) {
          result.suggestions.push(`Found invalid characters: ${[...new Set(invalidChars)].join(', ')}. Base58 excludes 0, O, I, l to avoid confusion.`);
        }

        result.suggestions.push(`Try this corrected CID: ${result.correctedCID}`);
      }
    }

    return result;
  };

  const handleValidation = () => {
    const result = validateCID(cid);
    setValidationResult(result);

    if (result.isValid && onValidCID) {
      onValidCID(cid);
    }
  };

  React.useEffect(() => {
    if (cid) {
      handleValidation();
    }
  }, [cid]);

  if (!validationResult) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">🔍 CID Validation Results</h2>

        {/* CID Input */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">📝 Checking CID:</h3>
          <div className="font-mono text-sm bg-white p-3 rounded border break-all">
            {cid}
          </div>
        </div>

        {/* Validation Results */}
        {validationResult.isValid ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">✅ Valid IPFS CID</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Format:</span>
                <div>{validationResult.format}</div>
              </div>
              <div>
                <span className="font-medium">Length:</span>
                <div>{cid.length} characters</div>
              </div>
            </div>

            {/* Access URLs */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">🔗 Access URLs:</h4>
              <div className="space-y-2">
                {validationResult.accessUrls.map((url: string, index: number) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs font-mono break-all"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">❌ Invalid IPFS CID</h3>

            {/* Errors */}
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2">🚫 Issues Found:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-700 mb-2">💡 Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                  {validationResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Corrected CID */}
            {validationResult.correctedCID && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800 mb-2">🔧 Suggested Correction:</h4>
                <div className="font-mono text-sm bg-white p-2 rounded border break-all">
                  {validationResult.correctedCID}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(validationResult.correctedCID);
                    alert('Corrected CID copied to clipboard!');
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  📋 Copy Corrected CID
                </button>
              </div>
            )}
          </div>
        )}

        {/* CID Format Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">📚 IPFS CID Format Guide</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">CID v0 (Legacy)</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Starts with "Qm"</li>
                <li>• Exactly 46 characters</li>
                <li>• Base58 encoding</li>
                <li>• Example: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-700 mb-2">CID v1 (Current)</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Starts with "bafy" or "bafk"</li>
                <li>• At least 59 characters</li>
                <li>• Base32 encoding</li>
                <li>• Example: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-medium text-blue-800 mb-2">🔧 Common Issues:</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• <strong>Wrong length:</strong> CID v0 must be exactly 46 chars, CID v1 at least 59</li>
              <li>• <strong>Wrong prefix:</strong> Must start with "Qm" (v0) or "bafy"/"bafk" (v1)</li>
              <li>• <strong>Invalid characters:</strong> Only alphanumeric characters allowed</li>
              <li>• <strong>Mock CIDs:</strong> Development CIDs may not point to real data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}