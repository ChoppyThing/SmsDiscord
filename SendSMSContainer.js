import React, { Component } from 'react';
import Scan from './scan';
import SendSMS from 'react-native-sms'
import SmsAndroid from 'react-native-get-sms-android';
import BackgroundJob from 'react-native-background-actions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const keepAlive = async (taskData) => {
    let filter = {
        box: 'inbox',
        read: 0,
        indexFrom: 0,
        maxCount: 10,
    };

    await new Promise(async (resolve) => {
      const { delay } = taskData;
      console.log(BackgroundJob.isRunning(), delay)
      for (let i = 0; BackgroundJob.isRunning(); i++) {
        console.log('Runned -> ', i);

        SmsAndroid.list(
            JSON.stringify(filter),
            (fail) => {
                console.log('Failed with this error: ' + fail);
            },
            (count, smsList) => {
                console.log('Count: ', count);
                console.log('List: ', smsList);
            },
        );

        await BackgroundJob.updateNotification({ taskDesc: 'Runned -> ' + i });
        await sleep(delay);
      }
    });
  };

  const options = {
    taskName: 'Example',
    taskTitle: 'ExampleTask title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'exampleScheme://chat/jane',
    parameters: {
      delay: 1000,
    },
  };

class SendSMSContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
    }

    componentDidMount() {
        this.pollSms()

        console.log('okkkk 2');
        let playing = BackgroundJob.isRunning();
        
        const toggleBackground = async () => {
          playing = !playing;
          if (playing) {
            console.log('okkkk 3');
            try {
              console.log('Trying to start background service');
              await BackgroundJob.start(keepAlive, options);
              console.log('Successful start!');
            } catch (e) {
              console.log('Error', e);
            }
          } else {
            console.log('Stop background service');
            await BackgroundJob.stop();
          }
        };

        toggleBackground();
    }

    sendSMS = () => {
        console.log('sendSMS');
        SendSMS.send({
            body: 'Hello test',
            recipients: ['0650762455'],
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true
        }, (completed, cancelled, error) => {
            console.log(completed, cancelled, error);
            if (completed) {
                console.log('SMS Sent Completed');
            } else if (cancelled) {
                console.log('SMS Sent Cancelled');
            } else if (error) {
                console.log('Some error occured');
            }
        });
    }

    pollSms = () => {
        let that;
        if (that === undefined) {
            that = this;
        }

        // const interval = setInterval(() => {
        //     setInterval(that.getSMS(), 3000);
        //   }, 3000);
        //   return () => clearInterval(interval);
        setTimeout(function(){
            that.getSMS();
            that.pollSms();
        } , 60000)
    }

    getSMS = () => {
        let filter = {
            box: 'inbox',
            read: 0,
            indexFrom: 0,
            maxCount: 10,
        };
        SmsAndroid.list(
            JSON.stringify(filter),
            (fail) => {
                console.log('Failed with this error: ' + fail);
            },
            (count, smsList) => {
                console.log('Count: ', count);
                console.log('List: ', smsList);
            },
        );
    }

    deleteSMS = () => {
        console.log('deleteSMS');
        SmsAndroid.delete(
            1234,
            (fail) => {
                console.log('Failed with this error: ' + fail);
            },
            (success) => {
                console.log('SMS deleted successfully');
            },
        );
    }

    render() {
        return (
            <Scan
                sendSMS={this.sendSMS}
                getSMS={this.getSMS}
                deleteSMS={this.deleteSMS}
            />
        );
    }
}

export default SendSMSContainer;