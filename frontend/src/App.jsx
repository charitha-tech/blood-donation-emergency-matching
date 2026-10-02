import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);

  const [donorForm, setDonorForm] = useState({
    name: "",
    blood_group: "",
    city: "",
    phone: "",
    age: "",
    last_donation_date: "",
    available: true,
  });

  const [requestForm, setRequestForm] = useState({
    hospital_name: "",
    blood_group: "",
    city: "",
    units_required: "",
    urgency: "HIGH",
  });

  const [requestId, setRequestId] = useState("");
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const donorsResponse = await fetch(
        "http://127.0.0.1:8000/donors"
      );

      const requestsResponse = await fetch(
        "http://127.0.0.1:8000/blood-requests"
      );

      const donorsData = await donorsResponse.json();
      const requestsData = await requestsResponse.json();

      setDonors(donorsData);
      setRequests(requestsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleDonorChange = (event) => {
    setDonorForm({
      ...donorForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleRequestChange = (event) => {
    setRequestForm({
      ...requestForm,
      [event.target.name]: event.target.value,
    });
  };

  // -----------------------------
  // DONOR VALIDATION
  // -----------------------------

  const validateDonorForm = () => {
    const name = donorForm.name.trim();
    const city = donorForm.city.trim();
    const phone = donorForm.phone.trim();
    const age = Number(donorForm.age);

    if (name.length < 2) {
      alert("Please enter a valid donor name.");
      return false;
    }

    if (donorForm.blood_group === "") {
      alert("Please select a blood group.");
      return false;
    }

    if (city.length < 2) {
      alert("Please enter a valid city.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone number must contain exactly 10 digits.");
      return false;
    }

    if (!Number.isInteger(age) || age < 18 || age > 65) {
      alert("Donor age must be between 18 and 65.");
      return false;
    }

    return true;
  };

  // -----------------------------
  // REGISTER DONOR
  // -----------------------------

  const registerDonor = async (event) => {
    event.preventDefault();

    if (!validateDonorForm()) {
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/donors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...donorForm,
            name: donorForm.name.trim(),
            city: donorForm.city.trim(),
            phone: donorForm.phone.trim(),
            age: Number(donorForm.age),
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setDonorForm({
        name: "",
        blood_group: "",
        city: "",
        phone: "",
        age: "",
        last_donation_date: "",
        available: true,
      });

      loadDashboardData();
    } catch (error) {
      console.error("Error registering donor:", error);
      alert("Could not register donor.");
    }
  };

  // -----------------------------
  // BLOOD REQUEST VALIDATION
  // -----------------------------

  const validateRequestForm = () => {
    const hospitalName = requestForm.hospital_name.trim();
    const city = requestForm.city.trim();
    const units = Number(requestForm.units_required);

    if (hospitalName.length < 2) {
      alert("Please enter a valid hospital name.");
      return false;
    }

    if (requestForm.blood_group === "") {
      alert("Please select a blood group.");
      return false;
    }

    if (city.length < 2) {
      alert("Please enter a valid city.");
      return false;
    }

    if (!Number.isInteger(units) || units < 1 || units > 20) {
      alert("Units required must be between 1 and 20.");
      return false;
    }

    return true;
  };

  // -----------------------------
  // CREATE BLOOD REQUEST
  // -----------------------------

  const createBloodRequest = async (event) => {
    event.preventDefault();

    if (!validateRequestForm()) {
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/blood-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestForm,
            hospital_name: requestForm.hospital_name.trim(),
            city: requestForm.city.trim(),
            units_required: Number(
              requestForm.units_required
            ),
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setRequestForm({
        hospital_name: "",
        blood_group: "",
        city: "",
        units_required: "",
        urgency: "HIGH",
      });

      loadDashboardData();
    } catch (error) {
      console.error("Error creating blood request:", error);
      alert("Could not create blood request.");
    }
  };

  // -----------------------------
  // FIND MATCHING DONORS
  // -----------------------------

  const findMatches = async (id = requestId) => {
    if (!id) {
      alert("Please select a blood request.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/matches/${id}`
      );

      const data = await response.json();

      setMatches(data.matching_donors || []);
      setRequestId(id);

      setTimeout(() => {
        document
          .getElementById("matches")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error("Error finding matches:", error);
      alert("Could not find matching donors.");
    }
  };

  // -----------------------------
  // UPDATE DONOR AVAILABILITY
  // -----------------------------

  const updateAvailability = async (
    donorId,
    currentAvailability
  ) => {
    const newAvailability = !currentAvailability;

    try {
      const fulfillRequest = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to mark this blood request as fulfilled?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/blood-requests/${id}/fulfill`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    alert(data.message);

    loadDashboardData();
  } catch (error) {
    console.error("Error fulfilling request:", error);
    alert("Could not update blood request.");
  }
};

      const data = await response.json();

      alert(data.message);

      loadDashboardData();
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Could not update donor availability.");
    }
  };

  // -----------------------------
  // MARK BLOOD REQUEST FULFILLED
  // -----------------------------

  const fulfillRequest = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this blood request as fulfilled?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/blood-requests/${id}/fulfill`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      alert(data.message);

      loadDashboardData();
    } catch (error) {
      console.error("Error fulfilling request:", error);
      alert("Could not update blood request.");
    }
  };

  const totalDonors = donors.length;

  const availableDonors = donors.filter(
    (donor) => donor.available === 1
  ).length;

  const totalRequests = requests.length;

  const openRequests = requests.filter(
    (request) => request.status === "OPEN"
  ).length;

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>LifeLine</h1>
          <p>
            Blood Donation & Emergency Matching Platform
          </p>
        </div>
      </header>

      <main className="container">

        {/* DASHBOARD CARDS */}

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <h3>Total Donors</h3>
            <p>{totalDonors}</p>
          </div>

          <div className="dashboard-card">
            <h3>Available Donors</h3>
            <p>{availableDonors}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Requests</h3>
            <p>{totalRequests}</p>
          </div>

          <div className="dashboard-card">
            <h3>Open Requests</h3>
            <p>{openRequests}</p>
          </div>

        </section>

        {/* DONOR AVAILABILITY */}

        <section className="section">
          <h2>Donor Availability</h2>

          {donors.length === 0 ? (
            <p>No donors registered yet.</p>
          ) : (
            <div className="donor-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>City</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {donors.map((donor) => (
                    <tr key={donor.id}>

                      <td>{donor.name}</td>

                      <td>{donor.blood_group}</td>

                      <td>{donor.city}</td>

                      <td>{donor.age}</td>

                      <td>
                        {donor.available === 1 ? (
                          <span className="available-status">
                            Available
                          </span>
                        ) : (
                          <span className="unavailable-status">
                            Unavailable
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          className={
                            donor.available === 1
                              ? "availability-btn unavailable-btn"
                              : "availability-btn available-btn"
                          }
                          onClick={() =>
                            updateAvailability(
                              donor.id,
                              donor.available === 1
                            )
                          }
                        >
                          {donor.available === 1
                            ? "Set Unavailable"
                            : "Set Available"}
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* RECENT BLOOD REQUESTS */}

        <section className="section">

          <h2>Recent Blood Requests</h2>

          {requests.length === 0 ? (
            <p>No blood requests yet.</p>
          ) : (
            <div className="donor-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Blood Group</th>
                    <th>City</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {requests.map((request) => (
                    <tr key={request.id}>

                      <td>{request.hospital_name}</td>

                      <td>{request.blood_group}</td>

                      <td>{request.city}</td>

                      <td>{request.units_required}</td>

                      <td>
                        <span
                          className={`urgency ${request.urgency.toLowerCase()}`}
                        >
                          {request.urgency}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            request.status === "OPEN"
                              ? "status open-status"
                              : "status fulfilled-status"
                          }
                        >
                          {request.status}
                        </span>
                      </td>

                      <td className="request-actions">

                        <button
                          className="find-donors-btn"
                          onClick={() =>
                            findMatches(request.id)
                          }
                        >
                          Find Donors
                        </button>

                        {request.status === "OPEN" && (
                          <button
                            className="fulfill-btn"
                            onClick={() =>
                              fulfillRequest(request.id)
                            }
                          >
                            Mark Fulfilled
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* REGISTER DONOR */}

        <section className="section">

          <h2>Register Donor</h2>

          <form
            className="form-grid"
            onSubmit={registerDonor}
          >

            <input
              type="text"
              name="name"
              placeholder="Donor Name"
              value={donorForm.name}
              onChange={handleDonorChange}
              required
            />

            <select
              name="blood_group"
              value={donorForm.blood_group}
              onChange={handleDonorChange}
              required
            >

              <option value="">
                Select Blood Group
              </option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>

            </select>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={donorForm.city}
              onChange={handleDonorChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="10-digit Phone Number"
              value={donorForm.phone}
              onChange={handleDonorChange}
              maxLength="10"
              required
            />

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={donorForm.age}
              onChange={handleDonorChange}
              min="18"
              max="65"
              required
            />

            <label>
              Last Donation Date

              <input
                type="date"
                name="last_donation_date"
                value={donorForm.last_donation_date}
                onChange={handleDonorChange}
              />

            </label>

            <button type="submit">
              Register Donor
            </button>

          </form>

        </section>

        {/* CREATE BLOOD REQUEST */}

        <section className="section">

          <h2>Create Blood Request</h2>

          <form
            className="form-grid"
            onSubmit={createBloodRequest}
          >

            <input
              type="text"
              name="hospital_name"
              placeholder="Hospital Name"
              value={requestForm.hospital_name}
              onChange={handleRequestChange}
              required
            />

            <select
              name="blood_group"
              value={requestForm.blood_group}
              onChange={handleRequestChange}
              required
            >

              <option value="">
                Select Blood Group
              </option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>

            </select>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={requestForm.city}
              onChange={handleRequestChange}
              required
            />

            <input
              type="number"
              name="units_required"
              placeholder="Units Required"
              min="1"
              max="20"
              value={requestForm.units_required}
              onChange={handleRequestChange}
              required
            />

            <select
              name="urgency"
              value={requestForm.urgency}
              onChange={handleRequestChange}
            >

              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>

            </select>

            <button type="submit">
              Create Blood Request
            </button>

          </form>

        </section>

        {/* MATCHING DONORS */}

        <section
          className="section"
          id="matches"
        >

          <h2>Matching Donors</h2>

          {matches.length === 0 ? (

            <p>
              Select a blood request and click{" "}
              <strong>Find Donors</strong> to see matching
              donors.
            </p>

          ) : (

            <div className="matching-results">

              <p>
                Matching donors for Request ID:{" "}
                <strong>{requestId}</strong>
              </p>

              <div className="match-grid">

                {matches.map((donor) => (

                  <div
                    className="match-card"
                    key={donor.id}
                  >

                    <h3>{donor.name}</h3>

                    <p>
                      <strong>Blood Group:</strong>{" "}
                      {donor.blood_group}
                    </p>

                    <p>
                      <strong>City:</strong>{" "}
                      {donor.city}
                    </p>

                    <p>
                      <strong>Age:</strong>{" "}
                      {donor.age}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {donor.phone}
                    </p>

                    <p className="available-status">
                      ● Available
                    </p>

                  </div>

                ))}

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;