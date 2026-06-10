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


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(max_length=255)
    phone: str = Field(max_length=20)
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email_or_username: str = Field(max_length=255)
    password: str = Field(max_length=128)


class UserResponse(BaseModel):
    id: str
    name: str
    username: Optional[str] = ""
    phone: Optional[str] = ""
    email: str
    is_admin: bool = False
    created_at: str


class FundWallet(BaseModel):
    amount: int = Field(gt=0)
    payment_method: str = Field(max_length=50, default="Airtel Money")


class SendMoney(BaseModel):
    country: str = Field(max_length=100)
    recipient_name: str = Field(min_length=1, max_length=200)
    wallet_type: str = Field(max_length=50)
    recipient_number: str = Field(min_length=1, max_length=50)
    amount: int = Field(gt=0)


class PayBill(BaseModel):
    biller: str = Field(max_length=100)
    account_number: str = Field(min_length=1, max_length=100)
    amount: int = Field(gt=0)


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    status: str
    amount: int
    fee: int
    payout: int
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
    balance: int
    created_at: str
    updated_at: str


class TestimonialCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    name: str = Field(default="", max_length=100)
    location: str = Field(default="", max_length=100)
    stars: int = Field(default=5, ge=1, le=5)


class TestimonialResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    location: str
    text: str
    stars: int
    is_approved: bool
    created_at: str


class UpdateTransactionStatus(BaseModel):
    status: TransactionStatus


class SettingCreate(BaseModel):
    key: str = Field(max_length=255)
    value: str = Field(max_length=5000)


class SupabaseLogin(BaseModel):
    access_token: str = Field(min_length=1, max_length=5000)


class ToggleTestimonialApproval(BaseModel):
    is_approved: bool


class AdminFundUser(BaseModel):
    user_id: str = Field(min_length=1, max_length=255)
    amount: int = Field(gt=0)


class SendMoneyResponse(BaseModel):
    success: bool
    reference: str
    amount: int
    fee: int
    total: int
    new_balance: int
    status: str
    replayed: bool = False


class PayBillResponse(BaseModel):
    success: bool
    reference: str
    amount: int
    fee: int
    total: int
    new_balance: int
    status: str
    replayed: bool = False
