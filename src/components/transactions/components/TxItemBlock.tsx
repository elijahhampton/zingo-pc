import React, { useState } from "react";
import dateformat from "dateformat";
import styles from "../Transactions.module.css";
import cstyles from "../../common/Common.module.css";
import { Transaction, TxDetail } from "../../appstate";
import Utils from "../../../utils/utils";
const { clipboard } = window.require("electron");

type TxItemBlockProps = {
  transaction: Transaction;
  currencyName: string;
  zecPrice: number;
  txClicked: (tx: Transaction) => void;
  addressBookMap: Map<string, string>;
};

const TxItemBlock = ({ transaction, currencyName, zecPrice, txClicked, addressBookMap }: TxItemBlockProps) => {
  const [expandAddress, setExpandAddress] = useState(false); 
  
  const txDate: Date = new Date(transaction.time * 1000);
  const datePart: string = dateformat(txDate, "mmm dd, yyyy");
  const timePart: string = dateformat(txDate, "hh:MM tt");

  return (
    <div>
      <div className={[cstyles.small, cstyles.sublight, styles.txdate].join(" ")}>{datePart}</div>
      <div
        className={[cstyles.well, styles.txbox].join(" ")}
        onClick={() => {
          txClicked(transaction);
        }}
      >
        <div className={styles.txtype}>
          <div>{transaction.type}</div>
          <div className={[cstyles.padtopsmall, cstyles.sublight].join(" ")}>{timePart}</div>
        </div>
        <div className={styles.txaddressamount}>
          {transaction.detailedTxns.map((txdetail: TxDetail) => {
            const { bigPart, smallPart }: {bigPart: string, smallPart: string} = Utils.splitZecAmountIntoBigSmall(Math.abs(parseFloat(txdetail.amount)));

            let { address } = txdetail;
            const { memo } = txdetail;

            if (!address) {
              address = "(Shielded)";
            }

            const label: string = addressBookMap.get(address) || "";

            return (
              <div key={address} className={cstyles.padtopsmall}>
                <div className={styles.txaddress}>
                  {label && (
                    <div className={cstyles.highlight} style={{ marginBottom: 5 }}>{label}</div> 
                  )}
                  <div className={[cstyles.verticalflex].join(" ")}>
                    <div
                      style={{ cursor: "pointer" }} 
                      onClick={() => {
                        if (address) {
                          clipboard.writeText(address);
                          setExpandAddress(true);
                        }
                      }}>
                      <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                        {!address && 'Unknown'}
                        {!expandAddress && !!address && Utils.trimToSmall(address, 10)}
                        {expandAddress && !!address && (
                          <>
                            {address.length < 80 ? address : Utils.splitStringIntoChunks(address, 3).map(item => <div key={item}>{item}</div>)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={[
                      cstyles.small,
                      cstyles.sublight,
                      cstyles.padtopsmall,
                      cstyles.memodiv,
                      styles.txmemo,
                    ].join(" ")}
                  >
                    {memo}
                  </div>
                </div>
                <div className={[styles.txamount, cstyles.right].join(" ")}>
                  <div>
                    <span>
                      {currencyName} {bigPart}
                    </span>
                    <span className={[cstyles.small, cstyles.zecsmallpart].join(" ")}>{smallPart}</span>
                  </div>
                  <div className={[cstyles.sublight, cstyles.small, cstyles.padtopsmall].join(" ")}>
                    {Utils.getZecToUsdString(zecPrice, Math.abs(parseFloat(txdetail.amount)))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TxItemBlock;