import { css } from "@emotion/css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Card from "./card";
import { ERC721_ABI } from "./erc721";

const address = "0xb16799BbD5e1C040E3c283Ec11E698046Fe4AF02";

const App = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");

  const [lastNFTUpdatedAt, setLastNFTUpdatedAt] = useState<number>(0);

  const [isNftSelected, setIsNftSelected] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<any>(null);

  const [sendNftToAddres, setSendNftToAddres] = useState<string>("");

  const [isNFTMintingInProgress, setIsNFTMintingInProgress] =
    useState<boolean>(false);

  const [isNFTTransferInProgress, setIsNFTTransferInProgress] =
    useState<boolean>(false);

  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {}, []);

  useEffect(() => {
    initNFTs();
    setInterval(() => {
      initNFTs();
    }, 1000 * 60 * 1);
  }, [account]);

  const initWeb3 = async () => {
    // @ts-ignore
    if (window.ethereum) {
      try {
        // @ts-ignore
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // @ts-ignore
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        // @ts-ignore
        window.ethereum.on("accountsChanged", async function (accounts) {
          // Time to reload your interface with accounts[0]!
          // @ts-ignore

          await window.ethereum.request({ method: "eth_requestAccounts" });
          // @ts-ignore
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts_updated = await web3Instance.eth.getAccounts();
          setAccount(accounts_updated[0]);
        });
        // @ts-ignore
        window.ethereum.on("networkChanged", function (networkId) {
          // Time to reload your interface with the new networkId
          if (networkId != 80001) {
            alert("Please switch to Mumbai Poligon Test Network.");
          }
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Please install Metamask to use this dApp.");
    }
  };

  const initNFTs = async () => {
    // @ts-ignore
    if (account) {
      if (
        lastNFTUpdatedAt > 0 &&
        Date.now() - lastNFTUpdatedAt < 1000 * 60 * 1
      ) {
        return;
      }

      try {
        const queryUrl = "&token_addresses=" + address;
        console.log({ queryUrl });

        const moralisApi =
          "ykEnM13eObcCorJBzIJvTmcv0d9IeYJJfadGKP0DKe15r96hjdktDwVxs9GcQvBA";
        const options = {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-API-Key": moralisApi,
          },
        };
        const resPonse = await axios.get(
          `https://deep-index.moralis.io/api/v2/${account}/nft?chain=mumbai&format=decimal${queryUrl}`,
          options
        );
        console.log({ data: resPonse.data.result });
        const promiseArr = [];
        for (let i = 0; i < resPonse.data.result.length; i++) {
          const nft = resPonse.data.result[i];
          const metadata = await (await axios.get(nft.token_uri)).data;
          promiseArr.push({ nftId: nft.token_id, nftData: metadata });
        }

        const nfts_temp = await Promise.all(promiseArr);
        setNfts(nfts_temp);
        setLastNFTUpdatedAt(Date.now());
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Please install Metamask to use this dApp.");
    }
  };

  const disconnectWallet = async () => {
    if (account && web3 && web3.eth.currentProvider) {
      try {
        // @ts-ignore
        console.log(web3.currentProvider);
        setWeb3(null);
        setAccount("");
        setNfts([]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const selectNFT = (nft: any) => {
    console.log({ nft });
    setIsNftSelected(true);
    setSelectedNft(nft);
  };

  const unselectNFT = () => {
    setIsNftSelected(false);
    setSelectedNft(null);
  };

  const transferNFT = async () => {
    if (sendNftToAddres && web3) {
      setIsNFTTransferInProgress(true);
      try {
        const contract = new web3.eth.Contract(ERC721_ABI, address);
        // check if to address is valid
        const isAddress = web3.utils.isAddress(sendNftToAddres);
        if (!isAddress) {
          alert("Please enter a valid address");
          setIsNFTTransferInProgress(false);
          return;
        }

        const tx = await contract.methods
          .safeTransferFrom(account, sendNftToAddres, selectedNft.nftId)
          .send({ from: account });

        alert("Transaction successful");
        // You can do something else here after the transaction is successful
        unselectNFT();
        setSendNftToAddres("");
        initNFTs();

        console.log({ tx });
      } catch (error: any) {
        alert(error.message);
        console.error(error);
      }
      setIsNFTTransferInProgress(false);
    }
  };

  const mintNFT = async () => {
    if (web3) {
      setIsNFTMintingInProgress(true);
      try {
        const contract = new web3.eth.Contract(ERC721_ABI, address);
        const tx = await contract.methods.mint().send({ from: account });

        alert("Transaction successful");
        // You can do something else here after the transaction is successful
        console.log({ tx });
      } catch (error: any) {
        alert(error.message);
        console.error(error);
      }
      setIsNFTMintingInProgress(false);
    }
  };

  return (
    <div
      className={css`
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}
    >
      {account ? (
        <div
          className={css`
            display: flex;
            width: 100%;
            height: 100%;
            min-height: 100vh;
            flex-direction: column;
            align-items: center;
          `}
        >
          {" "}
          <div
            className={css`
              font-size: 1.5rem;
              width: 100%;
              margin-top: 1rem;
              text-align: center;
            `}
          >
            Connected to {account} (Mumbai Poligon Testnet)
            <br />
            <button onClick={() => disconnectWallet()}>
              disconnect wallet
            </button>
          </div>{" "}
          <div
            className={css`
              display: flex;
              width: 90%;
              height: 5rem;
              justify-content: center;
              align-items: center;
              padding: 1rem;
            `}
          >
            <button
              className={css`
                width: 50%;
                height: 5rem;
                font-size: 1.5rem;
                background-color: #fff;
                border: 1px solid #fff;
                color: #000;
                border-radius: 0.5rem;
                cursor: pointer;
                :hover {
                  background-color: #000;
                  color: #fff;
                }
              `}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                isNFTMintingInProgress ? "" : mintNFT();
              }}
            >
              {isNFTMintingInProgress ? "Minting NFT..." : "Mint NFT"}
            </button>
          </div>
          <div
            className={css`
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            `}
          >
            <div
              className={css`
                font-size: 2rem;
                width: 100%;
                text-align: center;
              `}
            >
              {" "}
              Your Test NFTs{" "}
            </div>
            <div
              className={css`
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-start;
                align-items: center;
                width: 72.5rem;
                margin-top: 1rem;
                overflow-y: scroll;
                height: 40rem;
                padding: 1rem;
                padding-left: 2.5rem;
                border: 1px solid #fff;
                border-radius: 0.5rem;
              `}
            >
              {nfts.map((nft) => {
                return (
                  <Card
                    onClick={() => selectNFT(nft)}
                    nftData={nft.nftData}
                    tokenId={nft.nftId}
                    Key={nft.nftId}
                  />
                );
              })}
            </div>
          </div>
          {isNftSelected ? (
            <div
              className={css`
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                min-height: 100vh;
                background-color: #0007;
                position: absolute;
                top: 0;
                left: 0;
              `}
            >
              <div
                className={css`
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: #fff;
                  color: #000;
                  padding: 1rem;
                  border-radius: 1rem;
                  flex-direction: column;
                `}
              >
                <div
                  className={css`
                    font-size: 1.3rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                  `}
                >
                  {selectedNft.nftData.name}
                </div>
                <div>
                  <img
                    className={css`
                      width: 20rem;
                      border-radius: 1rem;
                    `}
                    src={selectedNft.nftData.image}
                    alt="nft"
                  />
                </div>

                <div
                  className={css`
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    margin-top: 1rem;
                  `}
                >
                  <input
                    className={css`
                      padding: 0.5rem 1rem;
                      border: 1px solid #000;
                      border-radius: 0.5rem;
                      margin-bottom: 1rem;
                      width: 100%;
                    `}
                    value={sendNftToAddres}
                    onChange={(e) => setSendNftToAddres(e.target.value)}
                    type="text"
                    name="transferToWallet"
                    id="TransferToWallet"
                    placeholder="Enter wallet address"
                  />
                </div>
                <div
                  className={css`
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                  `}
                >
                  <button
                    className={css`
                      padding: 0.5rem 2rem;
                      background-color: #000;
                      color: #fff;
                      border: 1px solid #000;
                      border-radius: 0.5rem;
                      cursor: pointer;
                      width: 100%;
                      font-weight: 800;
                      font-size: 1.2rem;
                      :hover {
                        scale: 1.01;
                        color: #fff;
                      }
                    `}
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      isNFTTransferInProgress ? "" : transferNFT();
                    }}
                  >
                    {isNFTTransferInProgress
                      ? "Tx In Progress..."
                      : "Transfer Nft"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <div>
          {" "}
          <button
            className={css`
              padding: 0.5rem 2rem;
              background-color: #fff;
              color: #000;
              border: 1px solid #fff;
              border-radius: 0.5rem;
              cursor: pointer;
              :hover {
                background-color: #000;
                color: #fff;
              }
            `}
            onClick={() => initWeb3()}
          >
            Connect Wallet
          </button>{" "}
        </div>
      )}
    </div>
  );
};

export default App;
