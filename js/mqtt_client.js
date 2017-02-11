var mqtt = require('mqtt')
const settings = require('electron-settings');

var serverAddress = null;
var serverPort = 0;
var inTopic = null;
var outTopic = null;
//mqtt client
var client = null;

var simpleAddress = null;

$(document).ready(function() {
  GetPreferences();


    console.log("ready!");
    $("#screen2").hide();
    $("#alert_msg").hide();


});

$("#connect").click(function() {
    Connect();
});

$("#subscribe_in").click(function() {
    SubscribeIn();
    SavePreferences();
});

$("#go_home").click(function() {
    GoHome();
});

$("#outTopic").change(function() {
    //alert( "Handler for .change() called." );
    outTopic = $("#outTopic").val().toString();
    $("#out_label").text(outTopic);
    SavePreferences();
});

$("#export-txt").click(function() {
    ExportTxt();
});


function Connect() {
    serverAddress =$("#server_address").val().toString();
    //serverAddress = "mqtt://test.mosquitto.org";

    try {
        client = mqtt.connect("mqtt://"+serverAddress);
        //alert("connecting..");
    } catch (err) {
        //alert("error!");
        //alert(err.message.toString());

    }



    client.on('connect', function() {
        $("#screen1").hide();
        //client.subscribe('presence')
        $("#screen2").show();
        //client.publish('presence', 'Hello mqtt')
        $("#label_server_address").text(serverAddress);
        SavePreferences();
    })

    client.on('error', function(err) {
        console.log('on error', err);
    });

    client.on('disconnect', function() {
        console.log('on disconnect');
    });

    client.on('reconnect', function() {
        console.log('on reconnect');
    });

    client.on('offline', function() {
        console.log('on offline');
        $("#alert_msg").html("<strong>Server Offline!</strong> There was a error trying to connect with this MQTT Server");
        $("#alert_msg").show();
    });

    client.on('message', function(topic, message) {
        // message is Buffer
        console.log(message.toString())
        var date = new Date();
        var current_hour = date.getHours();
        var msg = message.toString();
        var out = "[" + date + "] > " + msg + "\n";
        $('#in_console').append(out);

        $('#in_console').scrollTop = $('#in_console').scrollHeight;
        //client.end()
    })

}

function GoHome() {
    $("#screen2").hide();
    $("#screen1").show();
    $("#in_console").text("");
    client.end();

}

$("#publish").click(function() {
    Publish($("#message").val().toString());
});

function Publish(value) {
    outTopic = $("#outTopic").val().toString();
    client.publish(outTopic, value)
}

function SubscribeIn() {
    inTopic = $('#inTopic').val().toString();
    client.subscribe(inTopic);
    $("#label_console_in").text(serverAddress + "/" + inTopic.toString());

}

/*Resize Console*/
$(function() {
    function reSize() {
        $('#in_console').css({
            'height': (($(window).height()) - 250) + 'px'
        });
        //'width': (($(window).height()) - 30) + 'px'
    }
    $(document).ready(reSize);
    $(window).resize(reSize);
});

//autoscroll
$('#in_console').on('change', function(e) {
    var in_console = $(this);
    in_console.scrollTop($('#console')[0].scrollHeight);
})

/*--- User Preferences --*/
function SavePreferences() {
    settings.set('server', {
        address: serverAddress,
        inTopic: inTopic,
        outTopic: outTopic
    })
    console.log("User preferences saved");
    //settings.getSettingsFilePath();

}

function GetPreferences(){
  settings.get('server.address').then(val => {
    serverAddress = val;
    console.log("Loaded Address: " + val);
    $("#server_address").val(serverAddress);

    // => "Cosmo"
  });
  settings.get('server.inTopic').then(val => {
    inTopic = val;
    $("#inTopic").val(inTopic);

    // => "Cosmo
  });
  settings.get('server.outTopic').then(val => {
    outTopic = val;
      $("#outTopic").val(outTopic);
    // => "Cosmo"
  });
}

//Open Github
const shell = require('electron').shell;
   $('#open-github').click((event) => {
           event.preventDefault();
           //shell.openExternal("http://lucascassiano.github.com/electron");
           shell.openExternal(event.target.href);
   });


//save to files
//export txt
function ExportTxt(){
  var content = $("#in_console").text();
  var textFile = new Blob([content], {
     type: 'text/plain'
  });
  var date = new Date();
  var current_hour = date.getHours();
  var day = date.getDay();
  var filename = "mqtt_console_"+current_date+".txt";
  invokeSaveAsDialog(textFile, filename);
}
/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "image.png"
 */
function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        file.type = 'video/webm';
    }

    var fileExtension = file.type.split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}
