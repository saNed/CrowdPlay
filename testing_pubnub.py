
import sys
import time
from datetime import datetime
from pubnub.callbacks import SubscribeCallback
from pubnub.enums import PNStatusCategory
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub

from rtmidi.midiutil import open_midiport
import mido

# Using rtmidi, query the user for what MIDI controller will be used
port = sys.argv[1] if len(sys.argv) > 1 else None
try:
    midiin, port_name = open_midiport(port)
except (EOFError, KeyboardInterrupt):
    sys.exit()
output_MF3D = mido.open_output('MPKmini2') # open the corresponding Midi Port

 
pnconfig = PNConfiguration()

# pnconfig.publish_key = 'pub-c-606bf400-d602-4743-971e-71ffb676d65e' 
# pnconfig.subscribe_key = 'sub-c-533ed8e8-090b-11e7-afb0-0619f8945a4f'

pnconfig.publish_key = 'pub-c-cfd09a99-8261-4025-98fa-2cf0b2f39f3a'
pnconfig.subscribe_key = 'sub-c-b8b79242-0964-11e7-89e8-02ee2ddab7fe'


channel = "sample_project"

pubnub = PubNub(pnconfig)

class MySubscribeCallback(SubscribeCallback):
    def status(self, pubnub, status):
        print(status) 
    def presence(self, pubnub, presence):
        print(presence);
        pass  # handle incoming presence data
 
    def message(self, pubnub, message):
        print(message);
 
pubnub.add_listener(MySubscribeCallback())


print("Entering main loop. Press Control-C to exit.")
try:
    # Monitor presence for changes in occupancy
    # pubnub.subscribe().channels(channel).with_presence().execute()

    # Poll the MF3D infinitely for MIDI messages
    while True:
        msg = midiin.get_message()
        # Only consider messages with actual note information
        if msg:
            message, deltatime = msg
            print("%r" % message)

            # Timestamp to calculate roundtrip latency
            if message[0] == 144:
                stamp = datetime.utcnow()

            # Data to be transmitted. Parse "message" list into constituent parts
            data = {
                'type': message[0],
                'note': message[1],
                'velocity': message[2],
                'time': stamp.microsecond
            }
            print(data)

            def publish_callback(result, status):
                print(result, status);

            #Publish to pubnub channel
            pubnub.publish().channel(channel).message(data).async(publish_callback)

        # Polling interval
        time.sleep(0.01)

except KeyboardInterrupt:
    print('')
finally:
    print("Exit.")
    midiin.close_port()
    del midiin
 

