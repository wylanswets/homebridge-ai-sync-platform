var AISyncAccessory = require("./AISyncAccessory.js");

function AISyncFanAccessory(log, accessory, device, status, session) {
    AISyncAccessory.call(this, log, accessory, device, status, session);

    this.fan = device;

    this.service = this.accessory.getService(global.Service.Fan);

    this.service
        .getCharacteristic(global.Characteristic.On)
        .on('get', this._getCurrentState.bind(this))
        .on('set', this._setOnOffState.bind(this));

    this.service
        .getCharacteristic(global.Characteristic.RotationSpeed)
        .setProps({
            minValue: 0,
            maxValue: 100,
            minStep: 25,
          })
        .on('get', this._getSpeedState.bind(this))
        .on('set', this._setSpeedState.bind(this));
    
    

    this.lightService = this.accessory.getService(global.Service.Lightbulb);
    this.lightService
        .getCharacteristic(global.Characteristic.On)
        .on('get', this._getCurrentLightState.bind(this))
        .on('set', this._setLightOnOffState.bind(this));

    this.accessory.updateReachability(true);

    this.aisync = session;

}

AISyncFanAccessory.prototype = Object.create(AISyncAccessory.prototype);

AISyncFanAccessory.prototype.eventUpdate = function(data) {
    var status = data.data.changes.status;
    this.service
        .getCharacteristic(Characteristic.On)
        .setValue(status.H00, null, "internal");
    this.service
        .getCharacteristic(Characteristic.RotationSpeed)
        .setValue(status.H02, null, "internal");

    this.lightService
        .getCharacteristic(Characteristic.On)
        .setValue(status.H0B, null, "internal");
    
}

AISyncFanAccessory.prototype._getCurrentState = function(callback) {
    this.aisync.deviceStatus(this.deviceId, function(data) {
        if(data.data.status.H00 == 1) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    })
}

AISyncFanAccessory.prototype._setOnOffState = function(targetState, callback, context) {
    if (context == "internal") return callback(null); // we set this state ourself, no need to react to it
    var val = targetState === true ? 1 : 0;
    this.aisync.fanOnOff(this.deviceId, val, function(data) {
        callback(null);
    });
    
}

AISyncFanAccessory.prototype._getSpeedState = function(callback) {
    this.aisync.deviceStatus(this.deviceId, function(data) {
        callback(null, data.data.status.H02);
    });
}

AISyncFanAccessory.prototype._setSpeedState = function(targetValue, callback, context) {
    if (context == "internal") return callback(null); // we set this state ourself, no need to react to it
    this.aisync.fanSpeed(this.deviceId, targetValue, function(data) {
        callback(null);
    });
}

AISyncFanAccessory.prototype._getCurrentLightState = function(callback) {
    this.aisync.deviceStatus(this.deviceId, function(data) {
        if(data.data.status.H0B == 1) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    })
}

AISyncFanAccessory.prototype._setLightOnOffState = function(targetState, callback, context) {
    if (context == "internal") return callback(null); // we set this state ourself, no need to react to it
    var val = targetState === true ? 1 : 0;
    this.aisync.lightOnOff(this.deviceId, val, function(data) {
        callback(null);
    });
    
}

module.exports = AISyncFanAccessory;
