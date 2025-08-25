import { Response } from "express";
import BaseResponseDto from "../BaseResponseDto";

export default class MineBooksResponseDto extends BaseResponseDto{


constructor(res: Response,success:boolean,message: string,books?:any[]){

if(success){
    super(res,200,"pass",message,books || []);

}else{

    super(res,500,"fail",message,null);
}

}

}