const express = require('express');

const app = express();
const path = require('path');

// index page
app.get("/", (req, res) => {
    res.send("This is the MoJira API");
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
