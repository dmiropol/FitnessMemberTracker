/**
 * Background Cloud Function to be triggered by PubSub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.subscribe = function (event, callback) {
  const BigQuery = require('@google-cloud/bigquery');
  const projectId = "iot2analytics-2018"; //Enter your project ID here
  const datasetId = "memberFitness_tracker"; //Enter your BigQuery dataset name here
  const tableId = "memberFitness_trackerTable"; //Enter your BigQuery table name here -- make sure it is setup correctly
  const PubSubMessage = event.data;
  
  // Incoming data is in JSON format
  const incomingData = PubSubMessage.data ? Buffer.from(PubSubMessage.data, 'base64').toString() : "{'Member_ID':'Member_ID', 'First_Name':'First_Name', 'Last_Name':'Last_Name','Gender':'Gender','Age':'Age','Height':'Height','Weight':'Weight','Hours_Sleep':'Hours_Sleep','Calories_Consumed':'Calories_Consumed','Exercise_Calories_Burned':'Exercise_Calories_Burned','Date':'Date'}";
  
  console.log('start entry:' + incomingData);
  const jsonData = JSON.parse(incomingData);
  var rows = [jsonData];

  console.log(`Uploading data: ${JSON.stringify(rows)}`);

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Inserts data into a table
  bigquery
  .dataset(datasetId)
  .table(tableId)
  .insert(rows)
  .then(() => {
    console.log(`Inserted ${rows.length} rows`);
  })
  .catch(err => {
    if (err && err.name === 'PartialFailureError') {
      if (err.errors && err.errors.length > 0) {
        console.log('Insert errors:');
        err.errors.forEach(err => console.error(err));
      }
    } else {
      console.error('ERROR:', err);
    }
  });
  // [END bigquery_insert_stream]


  callback();
};