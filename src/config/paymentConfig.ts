export const PAYMENT_CONFIG = {
  BANK_DETAILS: {
    accountName: "KV INFRA BUILDCON PRIVATE LIMITED",
    accountNo: "5020 0095 7498 1623",
    ifsc: "HDFC0001234",
    bank: "HDFC Bank",
    upiId: "kvinfrabuildcon@idbi"
  },
  QR_CODE_IMAGE_PATH: "/kvinfra qr code.png"
};

/** Maps backend room type names to display labels. Keys match RoomType.name from the DB. */
export const ROOM_TYPE_MAP: Record<string, string> = {
  "Axis+": "AXIS+",
  "Axis": "AXIS",
  "Collective": "COLLECTIVE",
  "Nexus": "NEXUS",
};
