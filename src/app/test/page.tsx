"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import React, { useEffect, useState } from "react";
import { createWalletClient, custom, Hex, parseEther, recoverMessageAddress, verifyMessage } from "viem";
import {
  sepolia,
  base,
  arbitrumSepolia,
  gnosisChiado,
  avalanche,
  gnosis,
  polygonAmoy,
  polygon,
} from "viem/chains";

// https://viem.sh/docs/actions/wallet/introduction
// follow this file + link to implement the wallet client + wallet public actions

export default function Page() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const [walletClient, setWalletClient] = useState(null);
  const [addressss, setAddressss] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    const initializeWalletClient = async () => {
      if (!wallet) return;
      try {
        const provider = await wallet.getEthereumProvider();
        const client = createWalletClient({
          account: wallet.address as Hex,
          chain: arbitrumSepolia,
          transport: custom(provider),
        });
        setWalletClient(client as any);
        console.log("Connected wallet:", wallet.address);
      } catch (error) {
        console.error("Error initializing wallet client:", error);
      }
    };
    initializeWalletClient();
  }, [wallet]);

  const sendTransaction = async () => {
    if (!walletClient) return;
    try {
      const [address] = await walletClient.getAddresses();
      setAddressss(address);
      const hash = await walletClient.sendTransaction({
        account: address,
        to: "0x49c4f4b258B715A4d50e6642F325946e62A6B7bA",
        value: parseEther("0.001"),
      });
      console.log("Transaction hash:", hash);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  const handleChangeChain = async () => {
    if (!wallet) return;
    try {
      await wallet.switchChain(arbitrumSepolia.id);
      console.log("Switched to Arbitrum Sepolia");
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  const handleChangeToAVA = async () => {
    if (!walletClient) return;
    try {
        // so this switch is not working for testnets gotta fix this by defining own chain config
      await walletClient.switchChain({ id: avalanche.id });
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  const handleSignMessage = async () => {
    if (!walletClient) return;
    try {
        const signature_1 = await walletClient.signMessage({ 
            addressss,
            message: 'hello world',
          })
          setSignature(signature_1);
          console.log("Signature:", signature_1);
    } catch (error) {
        console.error("Error signing message:", error);
    }
  };

  const handleVerifySignature = async () => {
    if (!walletClient) return;
    try {
        const valid = await verifyMessage({ 
            address: addressss,
            message: 'hello world',
            signature,
          })

          console.log("Signature is valid:", valid);
    } catch (error) {
        console.error("Error verifying signature:", error);
    }
  }

  const handleGetAddressFromSign = async () => {
    if (!walletClient) return;
    try {
        const address = await recoverMessageAddress({ 
            message: 'hello world',
            signature,
          })

          console.log("Address from signature:", address);
    } catch (error) {
        console.error("Error verifying signature:", error);
    }
  }

  if (!ready) return <p>Loading...</p>;

  return (
    <div>
      {authenticated ? (
        <button onClick={logout}>Disconnect Wallet</button>
      ) : (
        <button onClick={login} disabled={!ready}>
          Connect Wallet
        </button>
      )}
      {authenticated && (
        <div>
          <button onClick={handleChangeChain}>Change Chain</button>
          <button onClick={sendTransaction}>Send Transaction</button>
        </div>
      )}
      <div>
        {wallet ? (
          <div>
            <div>Wallet Address: {wallet.address}</div>
            <div>Chain ID: {wallet.chainId}</div>
          </div>
        ) : (
          <div>No wallet connected</div>
        )}
      </div>

      <div>{addressss}</div>
      <div>
        <button onClick={handleChangeToAVA}>
        change to avalanche
        </button>
      </div>
      <div>
        <button onClick={handleSignMessage}>
            sign the hello world message
        </button>
        <button onClick={handleVerifySignature}>
            verify the signature
        </button>
        <button onClick={handleGetAddressFromSign}>
            get address form signature
        </button>
      </div>
    </div>
  );
}
