"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export interface ProofRequirement {
  name: string;
  description: string;
  proofType: 'SELF_AGE_VERIFICATION' | 'SELF_NATIONALITY' | 'EMAIL_VERIFICATION' | 'HACKERHOUSE_INVITATION' | 'CUSTOM';
  isRequired: boolean;
}

interface ProofSelectionProps {
  selectedProofs: ProofRequirement[];
  onProofsChange: (proofs: ProofRequirement[]) => void;
}

const AVAILABLE_PROOFS: ProofRequirement[] = [
  {
    name: "age_verification",
    description: "Must be over 18 years old",
    proofType: "SELF_AGE_VERIFICATION",
    isRequired: true
  },
  {
    name: "indian_citizen",
    description: "Must be Indian citizen",
    proofType: "SELF_NATIONALITY", 
    isRequired: true
  },
  {
    name: "netflix_subscription",
    description: "Must have active Netflix subscription",
    proofType: "EMAIL_VERIFICATION",
    isRequired: true
  },
  {
    name: "hackerhouse_invitation",
    description: "Must have HackerHouse invitation",
    proofType: "HACKERHOUSE_INVITATION",
    isRequired: true
  }
];

export default function ProofSelection({ selectedProofs, onProofsChange }: ProofSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleProof = (proof: ProofRequirement) => {
    const isSelected = selectedProofs.some(p => p.name === proof.name);
    
    if (isSelected) {
      onProofsChange(selectedProofs.filter(p => p.name !== proof.name));
    } else {
      onProofsChange([...selectedProofs, proof]);
    }
  };

  const getProofTypeIcon = (proofType: string) => {
    switch (proofType) {
      case 'SELF_AGE_VERIFICATION':
      case 'SELF_NATIONALITY':
        return '🔐'; // Self verification
      case 'EMAIL_VERIFICATION':
        return '📧'; // Email verification
      case 'HACKERHOUSE_INVITATION':
        return '🏠'; // HackerHouse
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Proof Requirements
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Choose which proofs sellers must provide to join this pool
        </p>
        
        {/* Selected Proofs */}
        {selectedProofs.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Proofs:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProofs.map((proof) => (
                <div
                  key={proof.name}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{getProofTypeIcon(proof.proofType)}</span>
                  <span>{proof.description}</span>
                  <button
                    onClick={() => toggleProof(proof)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dropdown Button */}
        <Button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full justify-between"
        >
          <span>
            {selectedProofs.length === 0 
              ? "Select proof requirements..." 
              : `${selectedProofs.length} proof(s) selected`
            }
          </span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </Button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
            {AVAILABLE_PROOFS.map((proof) => {
              const isSelected = selectedProofs.some(p => p.name === proof.name);
              return (
                <div
                  key={proof.name}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleProof(proof)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-gray-300"
                  />
                  <span className="text-lg">{getProofTypeIcon(proof.proofType)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{proof.description}</div>
                    <div className="text-sm text-gray-500">
                      {proof.proofType === 'SELF_AGE_VERIFICATION' || proof.proofType === 'SELF_NATIONALITY' 
                        ? 'Self Protocol Verification' 
                        : proof.proofType === 'EMAIL_VERIFICATION'
                        ? 'Email File Upload (.eml)'
                        : 'Custom Verification'
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProofs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-green-800">
              Sellers will need to provide {selectedProofs.length} proof(s) to join this pool
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
