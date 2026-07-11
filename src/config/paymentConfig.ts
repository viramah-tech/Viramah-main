export const PAYMENT_CONFIG = {
  BANK_DETAILS: {
    accountName: "",
    accountNo: "",
    ifsc: "",
    bank: "",
    upiId: ""
  },
  QR_CODE_IMAGE_PATH: ""
};

/** Maps backend room type names to display labels. Keys match RoomType.name from the DB. */
export const ROOM_TYPE_MAP: Record<string, string> = {
  "Axis+": "AXIS+",
  "Axis": "AXIS",
  "Collective": "COLLECTIVE",
  "Nexus": "NEXUS",
};
