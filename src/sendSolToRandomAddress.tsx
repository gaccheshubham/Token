import React, { FC } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { useCallback, useState } from "react";

export const SendSOLToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  let [receiver, setReceiver] = useState("");
  let [amount, setAmount] = useState(0);

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const receiverAddr = new PublicKey(receiver);
    // 890880 lamports as of 2022-09-01
    const lamports = await connection.getMinimumBalanceForRentExemption(0);
    console.log(`Sending lamports, MinimumBalanceForRentExemption: ${lamports} plus amount: ${amount}`);
    amount+=amount;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: receiverAddr,
        lamports: amount
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    console.log(`Tokens transfered, Transaction Hash: ${signature}`);

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
  }, [publicKey, sendTransaction, connection]);

  
  const handleReceiver = (event: any) => {
    setReceiver(event.target.value);
    receiver = event.target.value;
  };

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
    amount = event.target.value;
  };

  return (
    <div> Send Solana Tokens:
      <p></p>
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
      <button onClick={onClick} disabled={!publicKey}>
        Send SOL.
      </button>
      <p id="output" >
      </p>
    </div>
  );
};
