export const PAYMENT_CONFIG = {
  BANK_DETAILS: {
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "HI VIEW CONSTRUCTIONS PVT. LTD.",
    accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "89850200000101",
    ifsc: process.env.NEXT_PUBLIC_BANK_IFSC || "BARB0VJROHI",
    bank: process.env.NEXT_PUBLIC_BANK_NAME || "BANK OF BARODA, ROHINI",
    upiId: process.env.NEXT_PUBLIC_UPI_ID || "hivie85953101@barodampay"
  },
  QR_CODE_IMAGE_PATH: process.env.NEXT_PUBLIC_QR_CODE_IMAGE_PATH || "/hi view QR code.png"
};

/** Maps backend room type names to display labels. Keys match RoomType.name from the DB. */
export const ROOM_TYPE_MAP: Record<string, string> = {
  "Axis+": "AXIS+",
  "Axis": "AXIS",
  "Collective": "COLLECTIVE",
  "Nexus": "NEXUS",
};
