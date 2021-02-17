'use strict';

const Homey = require('homey');

class TemperatureBLEDevice extends Homey.Device
{
    /**
     * onInit is called when the device is initialized.
     */
    async onInit()
    {
        this.log('TemperatureBLEDevice has been initialized');

        try
        {
            this.getDeviceValues();
        }
        catch (err)
        {
            this.log(err);
        }
    }

    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
    async onAdded()
    {
        this.log('TemperatureBLEDevice has been added');
    }

    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({ oldSettings, newSettings, changedKeys })
    {
        this.log('TemperatureBLEDevice settings where changed');
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name)
    {
        this.log('TemperatureBLEDevice was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted()
    {
        await this.blePeripheral.disconnect();
        this.log('TemperatureBLEDevice has been deleted');
    }

    async getDeviceValues()
    {
        try
        {
            if (!this.updating)
            {
                this.updating = true;
                const dd = this.getData();

                let bleAdvertisement = await this.homey.ble.find(dd.id);
                this.homey.app.updateLog(this.homey.app.varToString(bleAdvertisement));
                let rssi = await bleAdvertisement.rssi;
                this.setCapabilityValue('rssi', rssi);

                let data = this.driver.parse(bleAdvertisement);
                if (data)
                {
                    this.homey.app.updateLog("Parsed BLE: " + this.homey.app.varToString(data));
                    this.setCapabilityValue('measure_temperature', data.serviceData.temperature.c);
                    this.setCapabilityValue('measure_humidity', data.serviceData.humidity);
                    this.setCapabilityValue('measure_battery', data.serviceData.battery);
                }
                else
                {
                    this.homey.app.updateLog("Parsed BLE: No service data");
                }
            }
            else
            {
                this.homey.app.updateLog("Refresh skipped while moving");
            }
        }
        catch (err)
        {
            this.log(err);
        }
        finally
        {
            this.updating = false;
        }
    }

    async syncBLEEvents(events)
    {
        try
        {
            const dd = this.getData();
            for (const event of events)
            {
                if (event.address && (event.address == dd.address))
                {
                    this.setCapabilityValue('measure_temperature', event.serviceData.temperature.c);
                    this.setCapabilityValue('measure_humidity', event.serviceData.humidity);
                    this.setCapabilityValue('measure_battery', event.serviceData.battery);
                    this.setCapabilityValue('rssi', event.rssi);
                }
            }
        }
        catch (error)
        {
            this.homey.app.updateLog("Error in temperature syncEvents: " + error, 0);
        }
    }

}

module.exports = TemperatureBLEDevice;