import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

type ReviewsByBookData = {
  reviews: any[];
  sentimentStats: { positive: number; neutral: number; negative: number };
  overall: { verdict: string; score: number };
};

export default class ListReviewsByBookResponseDto extends BaseResponseDto<ReviewsByBookData> {
  constructor(res: Response, success: boolean, message: string, data?: ReviewsByBookData) {
    super(
      res,
      success ? 200 : 404,
      success ? "pass" : "fail",
      message,
      data ?? {
        reviews: [],
        sentimentStats: { positive: 0, neutral: 0, negative: 0 },
        overall: { verdict: "N/A", score: 0 },
      }
    );
  }
}
