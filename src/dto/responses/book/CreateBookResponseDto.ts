import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";
import { any, success } from "zod";
export default class CreateBookResponseDto extends BaseResponseDto{

constructor(
res:Response,
success: boolean,
message: string,
createdBook?:any

){
    if (success){
        super(res,201,"pass",message,createdBook ||{});
    }else{
        super(res,400,"fail",message,null);
    }
}


}
