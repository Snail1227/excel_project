let selectedFile;

document
  .getElementById("input-excel")
  .addEventListener("change", function (event) {
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
      if (
        newCleanPhone.length === 10 ||
        (newCleanPhone.length === 11 && newCleanPhone[0] == "1")
      ) {
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
    const seenEmails = new Set();
    const seenPhones = new Set();
  
    filteredDataList.forEach(item => {
      const phone = item.Phone || '';
      const email = item.Email || '';
      const phoneEmailKey = `${phone}|${email}`;
  
      if (!seenPhones.has(phone) || !seenEmails.has(email)) {
        records.push(item);
        seenPhones.add(phone);
        seenEmails.add(email);
      }
    });
  
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

// Test

// const isValidEmail = (email) => {
//   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   console.log(regex.test(email));
//   return regex.test(email);
// };

// const email = "   gianna.acos   ta2120@gmail.com   ";

// isValidEmail(email)

// console.log(email);

// console.log(email.replace(/\s+/g, ""));

const list = [
  {
    id: 1,
    Phone: "3479417335",
    Email: "zindani2006@gmail.com",
  },
  {
    id: 2,
    Phone: "3479417335",
    Email: "zindani2006@gmail.com",
  },
  {
    id: 3,
    Phone: "123456785",
    Email: "1laura@gmail.com",
  },
  {
    id: 4,
    Phone: "",
    Email: "2laura@gmail.com",
  },
  {
      id: 5,
      "Phone": "",
      "Email": "2laura@gmail.com"
  },
  {
      id: 6,
      "Phone": "12345678912",
      "Email": ""
  },
  {
      id: 7,
      "Phone": "12345678912",
      "Email": ""
  },
];

const removeDuplicates = (filteredDataList) => {
    const records = [];
    const seenEmails = new Set();
    const seenPhones = new Set();
  
    filteredDataList.forEach(item => {
      const phone = item.Phone || '';
      const email = item.Email || '';
      const phoneEmailKey = `${phone}|${email}`;
  
      // Case: Unique phone and email combination.
      if (!seenPhones.has(phone) || !seenEmails.has(email)) {
        records.push(item);
        seenPhones.add(phone);
        seenEmails.add(email);
      }
      // Additional logic may be needed to prioritize items with phones or emails based on further requirements.
    });
  
    return records;
  };
  
  

console.log(removeDuplicates(list));
