# GPA & Rank Calculator API

This is an API built using Express.js that calculates a student's GPA based on results from a university portal and ranks students within a specified range based on their GPA.

## Features

- Fetches student results from the university's results page.
- Calculates GPA based on the latest attempt of each subject.
- Handles special cases:
  - No access students.
  - Deceased students.
  - Excludes non-credit subjects from GPA calculation.
- Allows ranking of students based on their GPA within a given range.
- Caches rank results to optimize performance.

## Technologies Used

- **Express.js**: A minimal and flexible Node.js web application framework.
- **Node-Cache**: Caches rank results to improve performance.
- **Cheerio**: Used to parse and extract data from HTML.
- **node-fetch**: A lightweight module that brings `window.fetch` to Node.js.
- **CORS**: Allows cross-origin resource sharing for the API.

## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm start
    ```

   By default, the server will run on port `3001`. You can configure this by setting the `PORT` environment variable.

## Endpoints

### `GET /rankresults`

Fetches student results and calculates the GPA.

#### Query Parameters:

- `stnum` (required): The student number for which GPA is to be calculated.

#### Example Request:

```bash
GET http://localhost:3001/rankresults?stnum=12345
```
Example Response:
json
```bash
{
  "gpa": "3.75",
  "mathGpa": "3.80",
  "cheGpa": "3.70",
  "phyGpa": "3.65",
  "zooGpa": "3.80",
  "botGpa": "3.70",
  "csGpa": "3.90"
}
```
GET /calculateRank
Calculates and returns the rank of a student within a specified range of student numbers.

Query Parameters:
startnum (required): The starting student number in the range.
endnum (required): The ending student number in the range.
stnum (required): The student number whose rank is to be calculated.
gpatype (required): The type of GPA to be considered for ranking (e.g., gpa, mathGpa, etc.).
Example Request:
```bash
GET http://localhost:3001/calculateRank?startnum=10000&endnum=10050&stnum=10010&gpatype=gpa
```
Example Response:
```bash
{
  "totalCount": 50,
  "rank": 5,
  "highestGpa": 4.00,
  "lowestGpa": 2.75,
  "averageGpa": 3.50
}
```
# Special Cases
## No Access Students
If a student number is in the noAccessStnum array, they will receive a "No access" notification. Add student numbers to the array as needed.

## Deceased Students
If a student number is in the deceasedStnum array, the API will respond with "Rest in Peace." Add student numbers to the array as needed.

## Non-Credit Subjects
Subjects listed in the nonCreditSubjects array will not be considered in the GPA calculation. This ensures that only credit-bearing subjects are included.

## Caching
The API uses node-cache to cache the rank results for 1000 seconds to reduce load on the server when multiple requests are made for the same student range and GPA type.

## License
This project is licensed under the MIT License.
