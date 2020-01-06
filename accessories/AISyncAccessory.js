function AISyncAccessory(log, accessory, device, status, session) {
    var info = accessory.getService(global.Service.AccessoryInformation);

    accessory.context.manufacturer = status.data.profile.esh.brand;
    info.setCharacteristic(global.Characteristic.Manufacturer, accessory.context.manufacturer.toString());
    
    accessory.context.model = status.data.profile.esh.model;
    info.setCharacteristic(global.Characteristic.Model, accessory.context.model.toString());
    
    accessory.context.serial = status.data.profile.module.mac_address;
    info.setCharacteristic(global.Characteristic.SerialNumber, accessory.context.serial.toString());
    
    accessory.context.revision = status.data.profile.module.firmware_version;
    info.setCharacteristic(global.Characteristic.FirmwareRevision, accessory.context.revision.toString());
    
    this.accessory = accessory;
    this.log = log;
    this.session = session;
    this.deviceId = device.device;
  }
  
  AISyncAccessory.prototype.event = function(event) {
    //This method needs to be overridden in each accessory type
  }
  
  module.exports = AISyncAccessory;
  