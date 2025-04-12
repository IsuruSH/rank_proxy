import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import * as cheerio from "cheerio";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
const noAccessStnum = []; // Add the student numbers that should receive "No access" notification
const nonCreditSubjects = [
  "MAT1142",
  "ICT1B13",
  "ENG1201",
  "ICT2B13",
  "ENG2201",
  "ENG3B10",
];
const deceasedStnum = ["11845"];

app.post("/creditresults", async (req, res) => {
  const { stnum, rlevel } = req.query;
  const { repeatedSubjects = { subjects: [], grades: [] } } = req.body; // Get repeated subjects from the request body

  const authHeader = req.headers["authorization"];
  const phpsessid =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const strippedStnum = stnum.startsWith(0) ? stnum.slice(1) : stnum;

  // Check if the stripped student number is in the no access list
  if (noAccessStnum.includes(strippedStnum) && !stnum.startsWith(0)) {
    return res
      .status(403)
      .json({ message: "No access to results for this student number" });
  }

  if (deceasedStnum.includes(strippedStnum)) {
    return res.status(200).json({ message: "Rest in Peace" });
  }

  const url = `https://paravi.ruh.ac.lk/fosmis2019/Ajax/result_filt.php?task=lvlfilt&stnum=${strippedStnum}&rlevel=${rlevel}`;

  try {
    const response = await fetch(url, {
      headers: {
        Cookie: `PHPSESSID=${phpsessid}`,
        Referer: "https://paravi.ruh.ac.lk/fosmis/",
        credentials: "include",
      },
    });
    const data = await response.text();
    // const json = await response.json();
    const $ = cheerio.load(data);
    const grades = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      E: 0.0,
      "E*": 0.0,
      "E+": 0.0,
      "E-": 0.0,
      F: 0.0,
      MC: 0.0,
    };

    let totalCredits = 0;
    let totalGradePoints = 0;

    let mathCredits = 0;
    let mathGradePoints = 0;

    let chemCredits = 0;
    let chemGradePoints = 0;

    let phyCredits = 0;
    let phyGradePoints = 0;

    let zooCredits = 0;
    let zooGradePoints = 0;

    let botCredits = 0;
    let botGradePoints = 0;

    let csCredits = 0;
    let csGradePoints = 0;

    const latestAttempts = {};

    // Process all rows to find the latest attempts
    $("tr.trbgc").each((i, el) => {
      const subjectCode =
        $(el).find("td").eq(0).text().trim() ||
        $(el).find("td").eq(0).text().trim().split(" ")[3];
      // console.log(subjectCode);
      const grade = $(el).find("td").eq(2).text().trim();
      const year = parseInt($(el).find("td").eq(3).text().trim());

      if (grades.hasOwnProperty(grade)) {
        if (!latestAttempts[subjectCode]) {
          latestAttempts[subjectCode] = { grade, year };
          // console.log(`${subjectCode}, ${year}: ${grade}`);
        }
      }
    });
    $("tr.selectbg").each((i, el) => {
      const subjectCode = $(el).find("td").eq(0).text().trim().split(" ")[3];
      // console.log(subjectCode);
      const grade = $(el).find("td").eq(1).text().trim();
      const year = parseInt($(el).find("td").eq(2).text().trim());

      if (grades.hasOwnProperty(grade)) {
        if (
          !latestAttempts[subjectCode] || // First occurrence
          grades[grade] > grades[latestAttempts[subjectCode].grade] || // Higher grade found
          (grades[grade] === grades[latestAttempts[subjectCode].grade] &&
            latestAttempts[subjectCode].year < year) // Same grade, newer year
        ) {
          latestAttempts[subjectCode] = { grade, year };
        }
      }
    });

    // Update latestAttempts with repeated subjects grades
    if (repeatedSubjects.subjects && repeatedSubjects.grades) {
      repeatedSubjects.subjects.forEach((subjectCode, index) => {
        if (latestAttempts[subjectCode] && repeatedSubjects.grades[index]) {
          // Update the grade in latestAttempts with the repeated subject grade
          latestAttempts[subjectCode].grade = repeatedSubjects.grades[index];
          console.log(
            `Updated ${subjectCode} grade to ${repeatedSubjects.grades[index]}`
          );
        }
      });
    }

    for (const [subjectCode, { grade, year }] of Object.entries(
      latestAttempts
    )) {
      // console.log(`${subjectCode}, ${year}: ${grade}`);
      if (nonCreditSubjects.includes(subjectCode)) continue;
      const lastChar = subjectCode.slice(-1);
      let credit;

      switch (lastChar) {
        case "0":
          credit = 0;
          break;
        case "1":
          credit = 1;
          break;
        case "2":
          credit = 2;
          break;
        case "3":
          credit = 3;
          break;
        case "4":
          credit = 4;
          break;
        case "5":
          credit = 5;
          break;
        case "6":
          credit = 6;
          break;
        case "α":
          credit = 1.5;
          break;
        case "β":
          credit = 2.5;
          break;
        case "δ":
          credit = 1.25;
          break;
      }

      totalCredits += credit;
      totalGradePoints += grades[grade] * credit;

      switch (true) {
        case subjectCode.startsWith("AMT"):
        case subjectCode.startsWith("IMT"):
        case subjectCode.startsWith("MAT"):
          mathCredits += credit;
          mathGradePoints += grades[grade] * credit;
          break;
        case subjectCode.startsWith("CHE"):
          chemCredits += credit;
          chemGradePoints += grades[grade] * credit;
          break;
        case subjectCode.startsWith("PHY"):
          phyCredits += credit;
          phyGradePoints += grades[grade] * credit;
          break;
        case subjectCode.startsWith("ZOO"):
          zooCredits += credit;
          zooGradePoints += grades[grade] * credit;
          break;
        case subjectCode.startsWith("BOT"):
          botCredits += credit;
          botGradePoints += grades[grade] * credit;
          break;
        case subjectCode.startsWith("COM"):
        case subjectCode.startsWith("CSC"):
          csCredits += credit;
          csGradePoints += grades[grade] * credit;
          break;
      }

      // console.log(`${subjectCode}, ${year}: ${grade}`);
    }

    // console.log(response);

    const result = {
      totalGradePoints,
      totalCredits,
      mathGradePoints,
      mathCredits,
      chemGradePoints,
      chemCredits,
      phyGradePoints,
      phyCredits,
      zooGradePoints,
      zooCredits,
      botGradePoints,
      botCredits,
      csGradePoints,
      csCredits,
    };
    // console.log(result);

    res.json(result);
  } catch (error) {
    res.status(500).send("no data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
