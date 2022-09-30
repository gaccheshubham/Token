import React, { FC } from "react";
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
  Account, createMint, getMint, mintTo,createTransferInstruction
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction,Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useState } from "react";


export const MintTokenWallet: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  let mint: PublicKey;
  let tokenAccount: Account;
  const fromWallet = Keypair.generate();

  let [balUser, setBalUser] = useState("");
  let [receiver, setReceiver] = useState("");
  let [amount, setAmount] = useState(0);

  const getBalance = useCallback(async () => {
    let receiverAddress = balUser;
    console.log(receiverAddress);
    const pubkey = new PublicKey(receiverAddress);
    console.log(pubkey);
    const tokenAccountInfo = await getAccount(connection, pubkey);
    console.log(`Balance is: ${tokenAccountInfo.amount}`);
  }, [publicKey, sendTransaction, connection]);


  async function createToken() {
    const airdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    let newBalance = await connection.getBalance(fromWallet.publicKey);
    console.log(`Account Funded,new Balance is : ${newBalance} SOL`);

    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      fromWallet.publicKey,
      9
    );
    console.log(`Token created by: ${fromWallet.publicKey}`);
    console.log(`Token Created Successfully at address: ${mint.toBase58()}`);

    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(
      `Tokens Stored Successfully at address: ${tokenAccount.address.toBase58()}`
    );
  }

  async function mintToken() {
    // Mint 1 new token to the "fromTokenAccount" account we just created
    const mintTransactionSignature = await mintTo(
      connection,
      fromWallet,
      mint,
      tokenAccount.address,
      fromWallet.publicKey,
      100000 // 10 billion
    );
    console.log(`Mint signature: ${mintTransactionSignature}`);
  }

  async function getTotalSupply() {
    // get the supply of tokens we have minted into existance
    const mintInfo = await getMint(connection, mint);
    console.log(`Current Total supply is ${mintInfo.supply}`);
  }

  // get the amount of tokens left in the account
  async function getTokenBalance() {
    const tokenAccountInfo = await getAccount(connection, tokenAccount.address);
    console.log(tokenAccountInfo.amount);
  }
    const sendTokens = useCallback(async () => {
      if (!publicKey) throw new WalletNotConnectedError();
      let receiverAddress = receiver;
      const tokens = amount;
      const pubkey = new PublicKey(receiverAddress);
      const transaction = new Transaction().add(
        createTransferInstruction(
          tokenAccount.address,
          pubkey,
          fromWallet.publicKey,

          1
        )
      );
      
      const signature = await sendTransaction(transaction, connection);
      
      await connection.confirmTransaction(signature, "processed");
      console.log(`Balance is: ${`d`}`);

    }, [publicKey, sendTransaction, connection]);

  const handleReceiver = (event: any) => {
    setReceiver(event.target.value);
    receiver = event.target.value;
  };

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
    amount = event.target.value;
  };

  const handleSetBalUser = (event: any) => {
    setBalUser(event.target.value);
    balUser = event.target.value;
  };

  return (
      <div>
      <div>
        Mint New Token
        <div>
          <button onClick={createToken}>Create Token</button>
          <button onClick={mintToken}>Mint Token</button>
          <button onClick={getTotalSupply}>Get Total Supply</button>
          <button onClick={getTokenBalance}>Get Token Balance</button>
          <button onClick={sendTokens}>SendTokens</button>
          <p id="output"></p>
      </div>
      <div>
        {" "}
        Check Balance
        <div>
          <input
            type="text"
            id="address"
            placeholder="Address"
            onChange={handleSetBalUser}
          ></input>
          <button onClick={getTokenBalance}>Check Balance</button> <br></br>
          <p id="output"></p>
        </div>
      </div>
      <div>
        {" "}
        Transfer
        <div>
          <input
            type="text"
            id="Address"
            placeholder="Receiver Address"
            onChange={handleReceiver}
          />
          <input
            type="number"
            id="Address"
            placeholder="Amount"
            onChange={handleAmount}
          />
          <button onClick={getBalance} disabled={!publicKey}>
            Send SOL.
          </button>
          <p id="output"></p>
        </div>
      </div>
    </div>
    </div>
  );
};
