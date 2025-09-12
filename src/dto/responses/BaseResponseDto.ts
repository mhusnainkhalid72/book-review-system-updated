import { Response } from "express";

type AnyObj = Record<string, any>;

function toPlain(val: any): any {
  if (!val) return val;
  if (typeof val.toJSON === "function") return val.toJSON();
  if (typeof val.toObject === "function") return val.toObject();
  return val;
}

function sanitize(val: any): any {
  if (Array.isArray(val)) {
    return val.map(sanitize);
  }

  const plain = toPlain(val);
  if (plain && typeof plain === "object") {
    const { __v, _id, ...rest } = plain as AnyObj;
    const clean: AnyObj =
      _id !== undefined
        ? { id: typeof _id?.toString === "function" ? _id.toString() : _id, ...rest }
        : rest;

    for (const key of Object.keys(clean)) {
      clean[key] = sanitize(clean[key]);
    }

    return clean;
  }

  return val;
}

export default class BaseResponseDto<T = any> {
  constructor(
    res: Response,
    statusCode: number,
    status: "pass" | "fail",
    message: string,
    data?: T | null
  ) {
    res.status(statusCode).json({
      statusCode,
      status,
      message,
      data: sanitize(data),
    });
  }
}
