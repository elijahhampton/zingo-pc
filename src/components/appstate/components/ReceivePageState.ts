import AddressType from "./AddressType";

export default class ReceivePageState {
    // A newly created address to show by default
    newAddress: string;
    newType: AddressType;
  
    // The key used for the receive page component.
    // Increment to force re-render
    rerenderKey: number;
  
    constructor(newAddress: string, newType: AddressType) {
      this.newAddress = newAddress;
      this.newType = newType;
      this.rerenderKey = 0;
    }
  }
  