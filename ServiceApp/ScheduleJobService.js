'use strict';

var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;

var connectionString = 'HostName=jbennettiotfree.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=GVvp3xzyxLYyGz/Bp6UgVd+J9NZRvsskXeJPAdGtHT4=';
var queryCondition = "deviceId IN ['testGeneral']";
var startTime = new Date();
var maxExecutionTimeInSeconds =  3600;
var jobClient = JobClient.fromConnectionString(connectionString);

function monitorJob (jobId, callback) {
    var jobMonitorInterval = setInterval(function() {
        jobClient.getJob(jobId, function(err, result) {
        if (err) {
            console.error('Could not get job status: ' + err.message);
        } else {
            console.log('Job: ' + jobId + ' - status: ' + result.status);
            if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
            clearInterval(jobMonitorInterval);
            callback(null, result);
            }
        }
        });
    }, 5000);
}

var methodParams = {
    methodName: 'lockDoor',
    payload: null,
    responseTimeoutInSeconds: 15 // Timeout after 15 seconds if device is unable to process method
};

var methodJobId = uuid.v4();
console.log('scheduling Device Method job with id: ' + methodJobId);
jobClient.scheduleDeviceMethod(methodJobId,
                            queryCondition,
                            methodParams,
                            startTime,
                            maxExecutionTimeInSeconds,
                            function(err) {
    if (err) {
        console.error('Could not schedule device method job: ' + err.message);
    } else {
        monitorJob(methodJobId, function(err, result) {
            if (err) {
                console.error('Could not monitor device method job: ' + err.message);
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        });
    }
});

var twinPatch = {
    etag: '*', 
    properties: {
        desired: {
            building: '43', 
            floor: 3
        }
    }
 };
 
 var twinJobId = uuid.v4();
 
 console.log('scheduling Twin Update job with id: ' + twinJobId);
 jobClient.scheduleTwinUpdate(twinJobId,
                             queryCondition,
                             twinPatch,
                             startTime,
                             maxExecutionTimeInSeconds,
                             function(err) {
     if (err) {
         console.error('Could not schedule twin update job: ' + err.message);
     } else {
         monitorJob(twinJobId, function(err, result) {
             if (err) {
                 console.error('Could not monitor twin update job: ' + err.message);
             } else {
                 console.log(JSON.stringify(result, null, 2));
             }
         });
     }
 });