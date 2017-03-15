
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

this.pubnub = new PubNub({
    publishKey: 'pub-c-606bf400-d602-4743-971e-71ffb676d65e',
    subscribeKey: 'sub-c-533ed8e8-090b-11e7-afb0-0619f8945a4f'
});

var musicFileNames = ['beyond_city_harp_[note_1].mp3',
                      'beyond_city_harp_[note_2].mp3',
                      'beyond_city_harp_[note_3].mp3',
                      'beyond_city_harp_[note_4].mp3',
                      'beyond_city_harp_[note_5].mp3',
                      'beyond_city_harp_[note_6].mp3',
                      'beyond_city_harp_[whole_section].mp3',
                      'item.mp3',
                      'secret.mp3'
                      ];

soundArr = [];

baseNote = 48; // bottom note of the keyboard

for (i = 0; i < musicFileNames.length; i++) {
    soundArr[i] = new Howl({
        src: ['music/' + musicFileNames[i] ],
        autoplay: false,
        loop: false,
        volume: 1,
        onend: function() {
            console.log('File is '+ musicFileNames[i]);
        }
    });
}

pubnub.addListener({
    status: function(statusEvent) {
    },
    message: function(message) {
        console.log("New Message!!", message);

        console.log('the message object', message.message);

        myNote = message.message.note - baseNote;
        if (myNote >= 0 && myNote <= soundArr.length) {

            if (message.message.type == 144) {
                // note attack
                soundArr[myNote].play();
            } else {
                // note release
                soundArr[myNote].stop();
            }

        }

    }
})


this.pubnub.subscribe({ channels: ['ch1', 'sample_project']})

var sound_secret = new Howl({
  src: ['music/secret.mp3'],
  autoplay: false,
  loop: false,
  volume: 1,
  onend: function() {
    console.log('Finished!');
  }
});

$('#secret-button').click(function() {
    sound_secret.play();
});

var sound_item = new Howl({
  src: ['music/item.mp3'],
  autoplay: false,
  loop: false,
  volume: 1,
  onend: function() {
    console.log('Finished!');
  }
});

$('#item-button').click(function() {
    sound_item.play();
});

