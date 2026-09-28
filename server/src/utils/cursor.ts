interface CursorPayload {
  createdAt: string;
  id: string;
}

export const encodeCursor = (createdAt: Date, id: string): string => {
  const payload: CursorPayload = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
};

export const decodeCursor = (cursor: string): CursorPayload => {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  return JSON.parse(decoded) as CursorPayload;
};
