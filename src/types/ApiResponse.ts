import { Message } from "../model/User.model";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAccepting?: boolean;
    messages?: Array<Message>
};

