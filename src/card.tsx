import React from "react";
import { css } from "@emotion/css";

const Card = ({ nftData, tokenId, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem;
        border-radius: 8px;
        box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.1);
        border: 1px solid #fff;
        width: 15rem;
        margin-right: 1.5rem;
        margin-bottom: 1.5rem;
        :hover {
          border: 1px solid #fff;
          background-color: #fff;
          color: #000;
          padding: 0.5rem;
        }
      `}
    >
      <img
        src={nftData.image ? nftData.image : "https://via.placeholder.com/150"}
        alt={nftData.name ? nftData.name : "NFT loading"}
        className={css`
          width: 15rem;
          height: auto;
          object-fit: cover;
          border-radius: 4px;
        `}
      />
      <h2
        className={css`
          font-size: 1.5rem;
          font-weight: bold;
        `}
      >
        {nftData.name ? nftData.name : "NFT loading"}
      </h2>
    </div>
  );
};

export default Card;
