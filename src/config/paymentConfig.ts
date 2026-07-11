export const PAYMENT_CONFIG = {
  BANK_DETAILS: {
    accountName: "KRISHNA VALLEY U/O HI-VIEW CONST PVT.LTD.",
    accountNo: "50200051621521",
    ifsc: "HDFC0000942",
    bank: "HDFC BANK",
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
