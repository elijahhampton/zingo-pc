import React, { useState } from "react";
import Modal from "react-modal";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styles from "../Send.module.css";
import cstyles from "../../common/Common.module.css";
import { SendPageState, Info, TotalBalance, SendProgress, AddressType, Address } from "../../appstate";
import Utils from "../../../utils/utils";
import ScrollPane from "../../scrollPane/ScrollPane";
import RPC from "../../../rpc/rpc";
import routes from "../../../constants/routes.json";
import ConfirmModalToAddr from "./ConfirmModalToAddr";

type ShieldConfirmModalProps = {
  addressBalance: number;
  shieldZec?: () => Promise<string | { txid: string }>;
  closeConfirmShieldModal: () => void;
  zecPrice: number;
  address: string;
  label?: string;
  destinationAddress: string;
  destinationBalance: number;
  currencyName: string;
  destinationPool: string;
  modalIsOpen: boolean;
  openErrorModal: (title: string, body: string | JSX.Element) => void;
  openPasswordAndUnlockIfNeeded: (successCallback: () => void | Promise<void>) => void;
};

const ShieldConfirmModalInternal: React.FC<RouteComponentProps & ShieldConfirmModalProps> = ({
  shieldZec,
  openErrorModal,
  closeConfirmShieldModal,
  modalIsOpen,
  history,
  label,
  zecPrice,
  currencyName,
  addressBalance,
  address,
  destinationPool,
  destinationAddress,
  destinationBalance,
  openPasswordAndUnlockIfNeeded
}) => {
  const defaultFee = RPC.getDefaultFee();
  const info = RPC.getInfoObject();
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(addressBalance);
  
  const onShield = async () => {
    // Close modal
    closeConfirmShieldModal()

    // Check to make sure the shieldZec method has been provided
    if (shieldZec) {
      // Alert user about shielding process
      openErrorModal("Shielding ZEC", "Please wait...This could take a while");
    
      // Set timeout to allow error modal to display
      setTimeout(() => {
        openPasswordAndUnlockIfNeeded(() => {
          (async () => {
            try {
              const resultStr = await shieldZec();
              // Check to see if the result string is 
              if (typeof resultStr === 'string' && !resultStr.includes("txid")) {
                throw new Error(resultStr);
              }
            
              openErrorModal("Shielding transaction was successfully broadcast.", `TXID: ${resultStr}`);
              
              // Redirect to dashboard after
              history.push(routes.DASHBOARD);
            } catch (error) {
              openErrorModal("Error", String(error));
            }
          })()
        })
      }, 10)
    }
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeConfirmShieldModal}
      className={styles.confirmModal}
      overlayClassName={styles.confirmOverlay}
    >
      <div className={[cstyles.verticalflex].join(" ")}>
        <div className={[cstyles.marginbottomlarge, cstyles.center].join(" ")}>Shield ZEC</div>
        <div className={cstyles.flex}>
          <div
            className={[
              cstyles.highlight,
              cstyles.xlarge,
              cstyles.flexspacebetween,
              cstyles.well,
              cstyles.maxwidth,
            ].join(" ")}
          >
            <div>Amount to Shield</div>
            <div className={[cstyles.right, cstyles.verticalflex].join(" ")}>
              <div>
                <span>
                  {currencyName} {bigPart}
                </span>
                <span className={[cstyles.small, styles.zecsmallpart].join(" ")}>{smallPart}</span>
              </div>

              <div className={cstyles.normal}>{Utils.getZecToUsdString(zecPrice, addressBalance)}</div>
            </div>
          </div>
        </div>

        <div className={[cstyles.verticalflex, cstyles.margintoplarge].join(" ")}>
          
              <ConfirmModalToAddr
                key={"fds"}
                toaddr={{ to: `From: ${address}`, amount: addressBalance, memo: "", memoReplyTo: "" }}
                info={info}
              />
            <ConfirmModalToAddr
              key={"fds"}
              toaddr={{ to: `To: ${destinationAddress}`, amount: destinationBalance, memo: "", memoReplyTo: "" }}
              info={info}
            />
            <ConfirmModalToAddr
              key={"fds"}
              toaddr={{ to: `Fee`, amount: defaultFee, memo: "", memoReplyTo: "" }}
              info={info}
            />

            <div className={cstyles.well}>
              <div className={[cstyles.flexspacebetween, cstyles.margintoplarge].join(" ")}>
                <div className={[styles.confirmModalAddress].join(" ")}>Destination Pool</div>
                <div className={[cstyles.verticalflex, cstyles.right].join(" ")}>
                  <div className={cstyles.large}>
                    <div>
                      <span>{destinationPool}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
        </div>

        <div className={cstyles.buttoncontainer}>
          <button type="button" className={cstyles.primarybutton} onClick={onShield}>
            Confirm Shield
          </button>
          <button type="button" className={cstyles.primarybutton} onClick={closeConfirmShieldModal}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default withRouter(ShieldConfirmModalInternal);
