from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class TransactionType(str, Enum):
    SEND = "send"
    RECEIVE = "receive"
    FUND = "fund"
    BILL = "bill"
    FEE = "fee"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class UserCreate(BaseModel):
    name: str
    phone: str
    email: str
    password: str


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    is_admin: bool = False
    created_at: str


class FundWallet(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = "Airtel Money"


class SendMoney(BaseModel):
    country: str
    recipient_name: str
    wallet_type: str
    recipient_number: str
    amount: float = Field(gt=0)


class PayBill(BaseModel):
    biller: str
    account_number: str
    amount: float = Field(gt=0)


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    status: str
    amount: float
    fee: float
    payout: float
    currency: str
    description: str
    reference: str
    country: Optional[str] = None
    recipient_name: Optional[str] = None
    wallet_type: Optional[str] = None
    recipient_number: Optional[str] = None
    created_at: str
    updated_at: str


class WalletResponse(BaseModel):
    id: str
    user_id: str
    balance: float
    created_at: str
    updated_at: str
