let selectedFile;

document.getElementById("upload-btn").addEventListener("click", function() {
  document.getElementById("input-excel").click();
});

document
  .getElementById("input-excel")
  .addEventListener("change", function (event) {
    const showFileName = this.files[0]?.name || "Select your file!";
    document.querySelector('.file-text').textContent = showFileName;

    selectedFile = event.target.files[0];
    fileName = event.target.files[0].name;
  });

document.getElementById("download-btn").addEventListener("click", function () {
  if (selectedFile) {
    Papa.parse(selectedFile, {
      complete: function (results) {
        const modifiedData = cleanThisUp(results.data);
        downloadCSVFromJson(modifiedData, fileName);
      },
      header: true,
    });
  } else {
    alert("Please select a file first.");
  }
});

function cleanThisUp(dataList) {
  const modifiedPhoneList = dataList.map((item) => {
    let phoneInfo = {};
    const resPartyPhone = item["ResParty Phone"];
    const patientPhone = item["Patient Cell Phone"];

    const cleanPhone = (phone) => phone.replace(/\D/g, "").trim();

    const isRealPhone = (phone) => {
      const newCleanPhone = cleanPhone(phone);
      const phonePattern =
        /^(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})$/;

      if (phonePattern.test(newCleanPhone)) {
        return true;
      } else {
        return false;
      }
    };

    if (
      resPartyPhone &&
      resPartyPhone.trim() !== "" &&
      isRealPhone(resPartyPhone)
    ) {
      phoneInfo.Phone = cleanPhone(resPartyPhone);
    } else if (
      patientPhone &&
      patientPhone.trim() !== "" &&
      isRealPhone(patientPhone)
    ) {
      phoneInfo.Phone = cleanPhone(patientPhone);
    } else {
      phoneInfo.Phone = "";
    }

    delete item["ResParty Phone"];
    delete item["Patient Cell Phone"];

    return {
      ...item,
      ...phoneInfo,
    };
  });

  const modifiedEmailList = modifiedPhoneList.map((item) => {
    let emailInfo = {};
    const resPartyEmail = item["ResParty Email"];
    const patientEmail = item["Patient Email Address"];

    const normalizeEmail = (email) => email.replace(/\s+/g, "").toLowerCase();

    const isValidEmail = (email) => {
      const fixEmail = normalizeEmail(email);
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(fixEmail);
    };

    if (
      resPartyEmail &&
      resPartyEmail.trim() !== "" &&
      isValidEmail(resPartyEmail)
    ) {
      emailInfo.Email = normalizeEmail(resPartyEmail);
    } else if (
      patientEmail &&
      patientEmail.trim() !== "" &&
      isValidEmail(patientEmail)
    ) {
      emailInfo.Email = normalizeEmail(patientEmail);
    } else {
      emailInfo.Email = "";
    }

    delete item["ResParty Email"];
    delete item["Patient Email Address"];

    return {
      ...item,
      ...emailInfo,
    };
  });

  const removeEmptyData = modifiedEmailList.filter((item) => {
    return item.Phone !== "" || item.Email !== "";
  });

  const removeDuplicates = (filteredDataList) => {
    const records = [];
    const seenEntries = new Map();

    filteredDataList.forEach((item) => {
      const phone = item.Phone || "";
      const email = item.Email || "";
      const balance = item["Contract Balance"]
        ? parseFloat(item["Contract Balance"])
        : 0;

      const uniqueKey = `${phone}|${email}`;

      if (!seenEntries.has(uniqueKey) || balance > 0 || balance < 0) {
        seenEntries.set(uniqueKey, item);
      }
    });

    seenEntries.forEach((value) => records.push(value));

    return records;
  };

  return removeDuplicates(removeEmptyData);
}

function downloadCSVFromJson(jsonData, filename) {
  const csvRows = [];
  const headers = Object.keys(jsonData[0]);
  csvRows.push(headers.join(","));

  for (const row of jsonData) {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");

  const blob = new Blob([csvString], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
