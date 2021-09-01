/*jslint node: true */
'use strict';

const Homey = require('homey');
const BLEDriver = require('../ble_driver');

class BLEContactDriver extends BLEDriver
{
    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        super.onInit();
        this.log('BLEContactDriver has been initialized');

        // Device Triggers
        this.bright_changed_trigger = this.homey.flow.getDeviceTriggerCard('bright_changed');
        // this.bright_true_trigger = this.homey.flow.getDeviceTriggerCard('bright_true');
        // this.bright_false_trigger = this.homey.flow.getDeviceTriggerCard('bright_false');
    }

    bright_changed(device, bright)
    {
        let tokens = {
            bright: bright
        };

        this.bright_changed_trigger.trigger(device, tokens)
            .catch(this.error);

        // if (bright)
        // {
        //     this.bright_true_trigger.trigger(device)
        //         .catch(this.error);
        // }
        // else
        // {
        //     this.bright_false_trigger.trigger(device)
        //         .catch(this.error);
        // }
    }

    /**
     * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
     * This should return an array with the data of devices that are available for pairing.
     */
    onPairListDevices()
    {
        return this.getBLEDevices('C');
    }
}

module.exports = BLEContactDriver;