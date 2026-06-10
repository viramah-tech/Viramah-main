export const PAYMENT_CONFIG = {
  BANK_DETAILS: {
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "KV INFRA BUILDCON PRIVATE LIMITED",
    accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "0274102000017213",
    ifsc: process.env.NEXT_PUBLIC_BANK_IFSC || "IBKL0000274",
    bank: process.env.NEXT_PUBLIC_BANK_NAME || "IDBI BANK, MATHURA",
    upiId: process.env.NEXT_PUBLIC_UPI_ID || "kvinfrabuildcon@idbi"
  },
  QR_CODE_IMAGE_PATH: process.env.NEXT_PUBLIC_QR_CODE_IMAGE_PATH || "/kvinfra qr code.png"
};

/** Maps backend room type names to display labels. Keys match RoomType.name from the DB. */
export const ROOM_TYPE_MAP: Record<string, string> = {
  "Axis+": "AXIS+",
  "Axis": "AXIS",
  "Collective": "COLLECTIVE",
  "Nexus": "NEXUS",
};
