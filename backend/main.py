from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
from pydantic import BaseModel
from database import init_db, get_connection

init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Donor(BaseModel):
    name: str
    blood_group: str
    city: str
    phone: str
    age: int
    last_donation_date: str | None = None
    available: bool = True


class BloodRequest(BaseModel):
    hospital_name: str
    blood_group: str
    city: str
    units_required: int
    urgency: str


@app.get("/")
def home():
    return {
        "message": "Blood Donation & Emergency Matching API is running!"
    }


# -----------------------------
# DONORS
# -----------------------------

@app.post("/donors")
def register_donor(donor: Donor):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO donors
        (name, blood_group, city, phone, age, last_donation_date, available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            donor.name,
            donor.blood_group,
            donor.city,
            donor.phone,
            donor.age,
            donor.last_donation_date,
            int(donor.available),
        ),
    )

    donor_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return {
        "message": "Donor registered successfully",
        "donor_id": donor_id
    }


@app.get("/donors")
def get_donors():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM donors")
    donors = cursor.fetchall()

    connection.close()

    return [dict(donor) for donor in donors]


@app.get("/donors/{donor_id}")
def get_donor(donor_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM donors WHERE id = ?",
        (donor_id,)
    )

    donor = cursor.fetchone()

    connection.close()

    if donor is None:
        return {
            "message": "Donor not found"
        }

    return dict(donor)


@app.put("/donors/{donor_id}/availability")
def update_donor_availability(
    donor_id: int,
    available: bool
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE donors
        SET available = ?
        WHERE id = ?
        """,
        (int(available), donor_id),
    )

    if cursor.rowcount == 0:
        connection.close()

        return {
            "message": "Donor not found"
        }

    connection.commit()
    connection.close()

    return {
        "message": "Donor availability updated successfully",
        "donor_id": donor_id,
        "available": available
    }


# -----------------------------
# BLOOD REQUESTS
# -----------------------------

@app.post("/blood-requests")
def create_blood_request(request: BloodRequest):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO blood_requests
        (hospital_name, blood_group, city, units_required, urgency)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            request.hospital_name,
            request.blood_group,
            request.city,
            request.units_required,
            request.urgency,
        ),
    )

    request_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return {
        "message": "Blood request created successfully",
        "request_id": request_id
    }


@app.get("/blood-requests")
def get_blood_requests():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM blood_requests")
    requests = cursor.fetchall()

    connection.close()

    return [dict(request) for request in requests]


# -----------------------------
# MARK REQUEST AS FULFILLED
# -----------------------------

@app.put("/blood-requests/{request_id}/fulfill")
def fulfill_blood_request(request_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE blood_requests
        SET status = 'FULFILLED'
        WHERE id = ?
        AND status = 'OPEN'
        """,
        (request_id,),
    )

    if cursor.rowcount == 0:
        connection.close()

        return {
            "message": "Request not found or already fulfilled"
        }

    connection.commit()
    connection.close()

    return {
        "message": "Blood request marked as fulfilled",
        "request_id": request_id,
        "status": "FULFILLED"
    }


# -----------------------------
# FIND MATCHING DONORS
# -----------------------------

@app.get("/matches/{request_id}")
def find_matches(request_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM blood_requests WHERE id = ?",
        (request_id,)
    )

    blood_request = cursor.fetchone()

    if blood_request is None:
        connection.close()

        return {
            "message": "Blood request not found"
        }

    eligibility_date = (
        date.today() - timedelta(days=90)
    ).isoformat()

    cursor.execute(
        """
        SELECT * FROM donors
        WHERE blood_group = ?
        AND city = ?
        AND available = 1
        AND (
            last_donation_date IS NULL
            OR last_donation_date <= ?
        )
        """,
        (
            blood_request["blood_group"],
            blood_request["city"],
            eligibility_date,
        ),
    )

    donors = cursor.fetchall()

    connection.close()

    return {
        "request_id": request_id,
        "blood_group": blood_request["blood_group"],
        "city": blood_request["city"],
        "matching_donors": [dict(donor) for donor in donors]
    }