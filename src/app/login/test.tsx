"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import RewardToken from "../../../RewardToken.json";

const contractABI = RewardToken.abi;
const contractAddress = "0x3B284DDcf13fbac389646C888C3dc669c00914Be";
const walletAddress1 = "0xAEDb4Aa3aa52953864b3e0813087E332F1Dcee3B";

export default function FetchBalance() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    async function setupEthers() {
      if (wallets.length === 0) return; // Ensure wallets exist before proceeding

      try {
        const wallet = wallets[0]; // Use the first connected wallet
        const provider = await wallet.getEthereumProvider(); // Get provider
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        setSigner(signer);
        setWalletAddress(wallet.address); // Save wallet address
      } catch (error) {
        console.error("Error setting up ethers:", error);
      }
    }

    setupEthers();
  }, [wallets]); // Watches `wallets`, not `user`

  const [retrievedNumber, setRetrievedNumber] = useState("");

  const readFromContract = async () => {
    if (!authenticated) {
      console.log("User not authenticated yet");
      return;
    }

    const provider = await wallets[0].getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    console.log("Signer:", signer.address);

    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call the read function
    try {
      const result = await contract.balanceOf(walletAddress1);

      // Convert result to a decimal number using ethers.js (assuming 18 decimals)
      const formattedBalance = ethers.formatUnits(result, 18);

      console.log("Retrieved balance:", formattedBalance);
      setRetrievedNumber(formattedBalance);
    } catch (error) {
      console.error("Error reading contract:", error);
    }
  };

  async function fetchBalance() {
    if (!signer || !walletAddress) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      console.log(contract);
      const rawBalance = await contract.balanceOf(walletAddress);
      console.log(rawBalance);

      setBalance(ethers.formatEther(rawBalance)); // Convert from Wei to ETH
    } catch (error) {
      console.error("Error fetching balance:", error);
      alert("Failed to fetch balance");
    }
  }

  if (!ready) return <p>Loading...</p>;

  return (
    <div>
      {authenticated ? (
        <>
          <p>Connected Wallet: {walletAddress ?? "Not connected"}</p>
          <p>
            Balance: {balance !== null ? `${balance} SHORTS` : "Not fetched"}
          </p>
          <button
            onClick={readFromContract}
            className="bg-green-500 p-2 text-white rounded"
          >
            Get Balance
          </button>
          <button
            onClick={logout}
            className="bg-red-500 p-2 text-white rounded ml-2"
          >
            Logout
          </button>
        </>
      ) : (
        <button onClick={login} className="bg-blue-500 p-2 text-white rounded">
          Login with Privy
        </button>
      )}
    </div>
  );
}
