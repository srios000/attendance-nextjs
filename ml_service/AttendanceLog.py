from pydantic import BaseModel
from typing import Optional
import datetime


class AttendanceLog(BaseModel):
    name: Optional[str] = None
    group: Optional[str] = None
    timestamp: Optional[datetime.datetime] = None
