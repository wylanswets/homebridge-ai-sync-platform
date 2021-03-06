var AISyncApi = require('ai-sync-api').AISyncApi
var Accessory, Service, Characteristic, UUIDGen;
var events = require('events');

var AISyncFanAccessory = require('./accessories/AISyncFanAccessory');

module.exports = function(homebridge) {

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory; global.Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service; global.Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic; global.Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerPlatform("homebridge-ai-sync-platform", "AISync", AISync, true);
}

function AISync(log, config, api) {
    this.log = log;
    this.accessories = [];
    this.api = api;
    this.subscribed = false;
    var self = this;
    this.aisync = null;
    this.config = config;
    if(config !== null) {
        this.api.on('didFinishLaunching', function() {
            self.aisync = new AISyncApi({
                email: config.email,
                password: config.password
            });
            self.aisync.getDevices(function(data) {
                var devices = data.data;
                for(var i in devices) {
                    var device = devices[i];
                    self.addAccessories(device);
                }
            });
            self.aisync.eventEmitter.on("device_change", self.eventHandler.bind(self));
        });
    }
    
}

AISync.prototype.eventHandler = function(data) {
    var uuid = UUIDGen.generate(data.data.device);
    var accessory = this.accessories[uuid];
    if(accessory !== undefined) {
        accessory.eventUpdate(data);
    }
}

AISync.prototype.configureAccessory = function(accessory) {
    this.accessories[accessory.UUID] = accessory;
    
    if(accessory.getService(Service.Lightbulb) === undefined) {
        //Adding light service to upgrade existing installs.
        accessory.addService(Service.Lightbulb);
    }
    if(this.config === null) {
        this.removeAccessory(accessory);
    }
}

AISync.prototype.addAccessories = function(device) {
    var self = this;
    self.aisync.deviceStatus(device.device, function(deviceStatus) {
        var uuid = UUIDGen.generate(deviceStatus.data.device);
        
        //Add fan
        var accessory = self.accessories[uuid];
        if(accessory === undefined) {
            self.registerFanAccessory(device, deviceStatus);
        } else {
            self.accessories[uuid] = new AISyncFanAccessory(self.log, (accessory instanceof AISyncFanAccessory ? accessory.accessory : accessory), device, deviceStatus, self.aisync);
        }

    });

}

AISync.prototype.registerFanAccessory = function(device, status) {
    var uuid = UUIDGen.generate(status.data.device);
    var name = device.properties.displayName == '' ? "Fan" : device.properties.displayName;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.Fan);
    acc.addService(Service.Lightbulb);

    this.accessories[uuid] = new AISyncFanAccessory(this.log, acc, device, status, this.aisync);

    this.api.registerPlatformAccessories("homebridge-ai-sync-platform", "AISync", [acc]);

}

AISync.prototype.removeAccessory = function(accessory) {
    if (accessory) {
        this.log("[" + accessory.name + "] Removed from HomeBridge.");
        if (this.accessories[accessory.UUID]) {
            delete this.accessories[accessory.UUID];
        }
        this.api.unregisterPlatformAccessories("homebridge-ai-sync-platform", "AISync", [accessory]);
    }
};