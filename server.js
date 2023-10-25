const express = require('express');

const app = express();
const path = require('path');

// index page
app.get("/", (req, res) => {
    res.send("This is the MoJira API");
});


// Body parser for API parameters
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2)

// utility method to get JSON output of Jira issues
function getJsonOutputList (jsonArrayObj) {
  
  jsonOutputList = []
      
  count = 0

  if (jsonArrayObj["issues"].length == undefined) {
    return [];
  }

  for (var i=0; i<jsonArrayObj["issues"].length; i++) {

    var issue = jsonArrayObj["issues"][i];
    //console.log(JSON.stringify(issue, null, 2));

    url = `https://${subdomain}.atlassian.net/browse/${issue['key']}`;
  
    output = {"subdomain": subdomain,
              "id": issue['id'], 
              "key": issue['key'], 
              "url": url, 
              "summary": issue['fields']['summary'], 
//              "description": (issue['fields']['description']) ? issue['fields']['description']['content'] : null,
              "assignee_id": (issue['fields']['assignee']) ? issue['fields']['assignee']['accountId'] : null,
              "assignee_name": (issue['fields']['assignee']) ? issue['fields']['assignee']['displayName'] : null,
              "reporter_id": (issue['fields']['reporter']) ? issue['fields']['reporter']['accountId'] : null,
              "reporter_name": (issue['fields']['reporter']) ? issue['fields']['reporter']['displayName'] : null,
              "issuetype": issue['fields']['issuetype']['name'],
              "priority": issue['fields']['priority']['name'],
              "status": issue['fields']['status']['name'],
              "votes": issue['fields']['votes']['votes']
              }

    jsonOutputList.push(output)
    count += 1
  }

  return jsonOutputList;
  
}


// API: Output JSON of Jira issues data based on Subdomain and Project Key
// -----------------------------------------------------------------------
app.get('/get-issues-from-project', async function (req, res) {

    subdomain = req.query.subdomain;
    project = req.query.project;
  
    if(subdomain == undefined || project == undefined) {
      // defaults
      subdomain = "ecosystem";
      project = "FRGE";
    }
  
    jqlString = `project = ${project} ORDER BY votes DESC`;
    
    fieldsString = 'key, summary, description, assignee, reporter, issuetype, priority, status, votes'
    urlString = 'https://'+subdomain+'.atlassian.net/rest/api/3/search?jql='+encodeURIComponent(jqlString)+'&fields='+encodeURIComponent(fieldsString);
    
    authString = process.env.AUTH_EMAIL + ":" + process.env.AUTH_TOKEN;
  
    fetch(urlString, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(authString).toString('base64')}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
    return response.text();
    })
    .then(text => {
    jsonArrayObj = JSON.parse(text)
    res.json(getJsonOutputList(jsonArrayObj));
    })
    .catch(err => console.error(err));
  
});


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
