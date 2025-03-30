const truncateAndMaskWalletAddress = (address) => {
    if(address){
    if (address.length <= 10) return address;
    return `${address.slice(0, 5)}****************${address.slice(-6)}`;
    }else{
      return address;
    }
  };
  export default truncateAndMaskWalletAddress;