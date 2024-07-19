let diagnosisHistory = {
  labels: [],
  systolic: {
    average: null,
    values: [],
    levels: [],
  },
  diastolic: {
    average: null,
    values: [],
    levels: [],
  },
};

let username = "coalition";
let password = "skills-test";
let auth = btoa(`${username}:${password}`);

fetch("https://fedskillstest.coalitiontechnologies.workers.dev", {
  headers: {
    Authorization: `Basic ${auth}`,
  },
})
  .then(function (response) {
    if (response.ok) {
      return response.json();
    }
    throw response;
  })
  .then(function (data) {
    const value = data[3]; // Jessica Taylor

    BuildResult(value);
    BuildDiagnosisHistory(value);
    BuildDiagnosticList(value.diagnostic_list);
    BuildLabResults(value.lab_results);

    BuildChart();
  })
  .catch(function (error) {
    console.warn(error);
  });

const BuildResult = (data) => {
  const {
    profile_picture,
    name,
    date_of_birth,
    gender,
    phone_number,
    emergency_contact,
    insurance_type,
  } = data;

  document.getElementById("result-patient-avatar").src = profile_picture; // bad res, but works
  document.getElementById("result-patient-name").innerText = name;
  document.getElementById("result-dob").innerText = date_of_birth;
  document.getElementById("result-gender").innerText = gender;
  document.getElementById("result-phone-number").innerText = phone_number;
  document.getElementById("result-emergency-contact").innerText =
    emergency_contact;
  document.getElementById("result-insurance-type").innerText = insurance_type;
};

const BuildDiagnosisHistory = (value) => {
  for (const key in value.diagnosis_history) {
    const history = value.diagnosis_history[key];

    diagnosisHistory.labels.unshift(
      `${history.month.substr(0, 3)}, ${history.year}`
    );
    diagnosisHistory.systolic.values.unshift(
      history.blood_pressure.systolic.value
    );
    diagnosisHistory.systolic.levels.unshift(
      history.blood_pressure.systolic.levels
    );

    diagnosisHistory.diastolic.values.unshift(
      history.blood_pressure.diastolic.value
    );
    diagnosisHistory.diastolic.levels.unshift(
      history.blood_pressure.diastolic.levels
    );
  }

  document.getElementById("chart-legend-systolic-value").innerText =
    diagnosisHistory.systolic.values.slice(-1);
  const systolicLevels = diagnosisHistory.systolic.levels.slice(-1)[0];
  if (systolicLevels.includes("Higher")) {
    document.getElementById(
      "chart-legend-systolic-levels"
    ).innerHTML = `<img src="./assets/ArrowUp.svg">${systolicLevels}`;
  } else if (systolicLevels.includes("Lower")) {
    document.getElementById(
      "chart-legend-systolic-levels"
    ).innerHTML = `<img src="./assets/ArrowDown.svg">${systolicLevels}`;
  } else {
    document.getElementById("chart-legend-systolic-levels").innerHTML =
      systolicLevels;
  }

  document.getElementById("chart-legend-diastolic-value").innerText =
    value.diagnosis_history[0].blood_pressure.diastolic.value;
  const diastolicLevels = diagnosisHistory.diastolic.levels.slice(-1)[0];
  if (diastolicLevels.includes("Higher")) {
    document.getElementById(
      "chart-legend-diastolic-levels"
    ).innerHTML = `<img src="./assets/ArrowUp.svg">${diastolicLevels}`;
  } else if (diastolicLevels.includes("Lower")) {
    document.getElementById(
      "chart-legend-diastolic-levels"
    ).innerHTML = `<img src="./assets/ArrowDown.svg">${diastolicLevels}`;
  } else {
    document.getElementById("chart-legend-diastolic-levels").innerHTML =
      diastolicLevels;
  }

  document.getElementById(
    "stats-respiratory-rate-value"
  ).textContent = `${value.diagnosis_history[0].respiratory_rate.value} bpm`;
  document.getElementById(
    "stats-respiratory-rate-levels"
  ).textContent = `${value.diagnosis_history[0].respiratory_rate.levels}`;

  document.getElementById(
    "stats-temperature-value"
  ).textContent = `${value.diagnosis_history[0].temperature.value}°F`;
  document.getElementById(
    "stats-temperature-levels"
  ).textContent = `${value.diagnosis_history[0].temperature.levels}`;

  document.getElementById(
    "stats-heart-rate-value"
  ).textContent = `${value.diagnosis_history[0].heart_rate.value} bpm`;
  const heartRateLevels = value.diagnosis_history[0].heart_rate.levels;
  if (heartRateLevels.includes("Higher")) {
    document.getElementById(
      "stats-heart-rate-levels"
    ).innerHTML = `<img src="./assets/ArrowUp.svg">${heartRateLevels}`;
  } else if (heartRateLevels.includes("Lower")) {
    document.getElementById(
      "stats-heart-rate-levels"
    ).innerHTML = `<img src="./assets/ArrowDown.svg">${heartRateLevels}`;
  } else {
    document.getElementById("stats-heart-rate-levels").innerHTML =
      heartRateLevels;
  }
};

const BuildDiagnosticList = (list) => {
  const table = document.getElementById("diagnosic-list-table");

  list.forEach((data) => {
    const row = table.insertRow();
    Object.values(data).forEach((value) => {
      const cell = row.insertCell();
      cell.textContent = value;
    });
  });
};

const BuildLabResults = (results) => {
  const list = document.getElementById("lab-results-list");

  for (const key in results) {
    const name = results[key];

    list.insertAdjacentHTML(
      "beforeend",
      `
            <li>
                <span>${name}</span>
                <img class="download" src="./assets/download_FILL0_wght300_GRAD0_opsz24 (1).svg">
            </li>
        `
    );
  }
};

function BuildChart() {
  const ctx = document.getElementById("blood-pressure-chart").getContext("2d");
  const data = {
    labels: [
      "Oct, 2023",
      "Nov, 2023",
      "Dec, 2023",
      "Jan, 2024",
      "Feb, 2024",
      "Mar, 2024",
    ],
    datasets: [
      {
        label: "Systolic",
        data: diagnosisHistory.systolic.values,
        borderColor: "#C26EB4",
        backgroundColor: "#E66FD2",
        fill: false,
        pointRadius: 6,
        pointBorderColor: "white",
        tension: 0.4,
      },
      {
        label: "Diastolic",
        data: diagnosisHistory.diastolic.values,
        borderColor: "#7E6CAB",
        backgroundColor: "#8C6FE6",
        fill: false,
        pointRadius: 6,
        pointBorderColor: "white",
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 180,
        min: 60,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    layout: {
      padding: 20,
    },
    elements: {
      point: {
        borderWidth: 1,
      },
    },
  };

  const config = {
    type: "line",
    data: data,
    options: options,
  };

  new Chart(ctx, config);
}
